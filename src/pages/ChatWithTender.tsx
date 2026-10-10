import React, { useState, useEffect, useRef } from 'react';
import { useTender } from '../context/TenderContext';
import { useAuth } from '../context/AuthContext';
import { TenderDocument, ChatMessage, ChatSourceReference } from '../types/tender';
import { formatCurrency } from '../utils/calculations';
import { extractTenderMetadataFromText } from '../utils/textParser';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import {
  MessageSquareText,
  Send,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  FileCheck,
  Building2,
  Layers,
  X,
  HardHat
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What is the estimated project cost?',
  'What is the EMD amount?',
  'What is the submission deadline?',
  'What are the eligibility requirements?',
  'What is the project completion duration?',
  'Summarize the important contract clauses.',
  'What quantities and units appear in the BOQ?'
];

export const ChatWithTender: React.FC = () => {
  const { user } = useAuth();
  const {
    tenders,
    activeTenderId,
    setActiveTenderId,
    activeTender,
    deleteTender,
    addTender,
    setCurrentPage,
    showNotification
  } = useTender();

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  // Delete confirmation modal
  const [deleteConfirmTender, setDeleteConfirmTender] = useState<TenderDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile sidebar toggle
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Firestore sync: listen for conversation messages for active tender
  useEffect(() => {
    if (!user || !activeTenderId) {
      setMessages([]);
      return;
    }

    // Safety: only load messages for tenders owned by current user
    if (activeTender && activeTender.ownerUid && activeTender.ownerUid !== user.uid) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'tenders', activeTenderId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ChatMessage, 'id'>)
          });
        });
        setMessages(loaded);
      },
      (err) => {
        console.warn('Chat messages sync note:', err?.message);
      }
    );

    return () => unsubscribe();
  }, [user, activeTenderId, activeTender]);

  // Send question to RAG pipeline
  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isSending) return;
    if (!activeTender) {
      setChatError('Please select or upload a tender document first.');
      return;
    }

    setChatError(null);
    setInputValue('');
    setIsSending(true);

    const userMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      tenderId: activeTender.id,
      ownerUid: user?.uid,
      sender: 'user',
      text: question,
      timestamp: new Date().toISOString()
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to Firestore
    if (user) {
      const userMsgRef = doc(db, 'tenders', activeTender.id, 'messages', userMessageId);
      setDoc(userMsgRef, userMessage).catch((err) => {
        console.warn('Failed to persist user message in Firestore:', err?.message);
      });
    }

    try {
      // Call backend RAG API endpoint
      const response = await fetch('/api/chat-with-tender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          tenderId: activeTender.id,
          tenderTitle: activeTender.title,
          nitNumber: activeTender.nitNumber,
          pages: activeTender.extractedPages || [],
          rawText: activeTender.rawTextExcerpt || ''
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server error while generating answer.');
      }

      const aiMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        tenderId: activeTender.id,
        ownerUid: user?.uid,
        sender: 'assistant',
        text: data.answer || 'I could not find this information in the relevant sections of the uploaded tender.',
        timestamp: new Date().toISOString(),
        sources: data.sources || [],
        confidence: data.answer?.includes('could not find') ? 'not_found' : 'grounded'
      };

      // Update state
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message to Firestore
      if (user) {
        const aiMsgRef = doc(db, 'tenders', activeTender.id, 'messages', aiMessageId);
        setDoc(aiMsgRef, aiMessage).catch((err) => {
          console.warn('Failed to persist assistant message in Firestore:', err?.message);
        });
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err.message || 'Failed to get an answer. Please check the network connection.');
      
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        tenderId: activeTender.id,
        sender: 'assistant',
        text: `Error retrieving answer: ${err.message || 'The server encountered an error processing your query.'}`,
        timestamp: new Date().toISOString(),
        confidence: 'inconclusive'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle PDF file selection & upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      setUploadError('Only PDF documents are supported for Chat with Tender.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setUploadError('File size exceeds the 30MB maximum limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgressText('Uploading PDF to server extraction pipeline...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgressText('Extracting PDF text and analyzing page sections...');
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to extract text from the PDF.');
      }

      setUploadProgressText('Extracting procurement parameters & clauses...');

      // Deterministically parse standard civil tender fields from extracted text
      const extractedMetadata = extractTenderMetadataFromText(result.rawText || '');

      const tenderId = `tnd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const nitNumber = (extractedMetadata as any).nitNumber || `NIT-${Date.now().toString().slice(-6)}`;
      const estimatedCost = extractedMetadata.estimatedCost || 150000000;
      const emdAmount = extractedMetadata.emdAmount || Math.round(estimatedCost * 0.02);

      const newTender: Omit<TenderDocument, 'ownerUid'> = {
        id: tenderId,
        title: (extractedMetadata as any).title || file.name.replace(/\.pdf$/i, ''),
        nitNumber,
        authority: (extractedMetadata.authority as any) || 'CPWD',
        issuingDepartment: `Executive Engineer Division, ${extractedMetadata.authority || 'CPWD'}`,
        estimatedCost,
        currency: 'INR',
        emdAmount,
        tenderFee: extractedMetadata.tenderFee || 5000,
        bidSecurityType: 'Bank Guarantee',
        publicationDate: new Date().toISOString().split('T')[0],
        submissionDeadline: extractedMetadata.submissionDeadline || '2026-11-30',
        preBidMeetingDate: extractedMetadata.preBidMeetingDate || '2026-11-15',
        technicalBidOpeningDate: '2026-12-01',
        workLocation: 'Civil Engineering Project Zone, India',
        completionPeriodMonths: extractedMetadata.completionMonths || 12,
        defectLiabilityMonths: 24,
        status: 'In Review',
        originalFileName: file.name,
        fileSize: file.size,
        pageCount: result.pageCount || 1,
        processingStatus: 'Ready',
        extractedPages: result.pages || [],
        rawTextExcerpt: (result.rawText || '').slice(0, 20000),
        boqItems: [],
        clauses: extractedMetadata.clauses || [],
        eligibility: [],
        deadlines: [
          {
            id: `dl-${Date.now()}-1`,
            milestone: 'Bid Submission Deadline',
            date: extractedMetadata.submissionDeadline || '2026-11-30',
            type: 'submission',
            status: 'upcoming',
            notes: 'Online packet upload'
          }
        ],
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      await addTender(newTender);
      setActiveTenderId(tenderId);
      setMessages([]);
      showNotification(`"${file.name}" uploaded and indexed successfully (${result.pageCount} pages).`, 'success');
      setMobileDocsOpen(false);
    } catch (err: any) {
      console.error('PDF upload failure:', err);
      setUploadError(err.message || 'Failed to process PDF.');
      showNotification(err.message || 'Upload failed.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Clear conversation / New Chat
  const handleNewChat = async () => {
    if (!activeTender || messages.length === 0) return;
    if (!window.confirm('Start a new chat? This will clear the current conversation history for this tender.')) {
      return;
    }

    try {
      if (user) {
        const messagesRef = collection(db, 'tenders', activeTender.id, 'messages');
        const snaps = await getDocs(messagesRef);
        const deletes = snaps.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletes);
      }
      setMessages([]);
      showNotification('Conversation reset.', 'info');
    } catch (err: any) {
      console.error('Error clearing conversation:', err);
      setMessages([]);
    }
  };

  // Delete tender
  const confirmDeleteTender = async () => {
    if (!deleteConfirmTender) return;
    setIsDeleting(true);
    try {
      await deleteTender(deleteConfirmTender.id);
      setDeleteConfirmTender(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4">
      {/* Top Banner & Control Room Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Chat with Tender
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                RAG RETRIEVAL · GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded AI answering restricted strictly to your selected construction tender PDF.
            </p>
          </div>
        </div>

        {/* Mobile Document Drawer Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDocsOpen(!mobileDocsOpen)}
            className="md:hidden py-1.5 px-3 bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1.5 font-mono"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Documents ({tenders.length})</span>
          </button>

          {activeTender && (
            <button
              onClick={() => setCurrentPage('analysis')}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs transition-colors font-mono"
              title="Open full tender engineering analysis"
            >
              <span>View Analysis</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Panel Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Document Selection Panel (Left Column) */}
        <div
          className={`
            ${mobileDocsOpen ? 'fixed inset-y-16 left-4 right-4 z-40 bg-[#0E1726] p-4 rounded-xl border border-slate-700 shadow-2xl overflow-y-auto' : 'hidden md:flex'}
            w-full md:w-80 lg:w-88 flex-col shrink-0 bg-[#0E1726] border border-slate-800 rounded-xl overflow-hidden shadow-lg
          `}
        >
          {/* Header & Upload Button */}
          <div className="p-3.5 border-b border-slate-800 bg-[#0B0F17]/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                Tender PDFs ({tenders.length})
              </span>
            </div>
            {mobileDocsOpen && (
              <button
                onClick={() => setMobileDocsOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Action Area */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Document...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload New Tender PDF</span>
                </>
              )}
            </button>

            {/* Upload progress & error */}
            {isUploading && (
              <div className="mt-2 p-2 bg-amber-950/30 border border-amber-800/50 rounded text-[11px] text-amber-300 flex items-center gap-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                <span className="truncate">{uploadProgressText || 'Extracting PDF...'}</span>
              </div>
            )}

            {uploadError && (
              <div className="mt-2 p-2 bg-rose-950/40 border border-rose-800/60 rounded text-[11px] text-rose-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{uploadError}</span>
              </div>
            )}
          </div>

          {/* Tender Documents List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tenders.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-mono">No tenders uploaded yet.</p>
                <p className="text-[11px] text-slate-500">
                  Upload a civil tender PDF to start asking grounded questions.
                </p>
              </div>
            ) : (
              tenders.map((tender) => {
                const isSelected = tender.id === activeTenderId;
                const status = tender.processingStatus || 'Ready';

                return (
                  <div
                    key={tender.id}
                    onClick={() => {
                      setActiveTenderId(tender.id);
                      setMobileDocsOpen(false);
                    }}
                    className={`
                      group relative p-3 rounded-lg border text-left cursor-pointer transition-all
                      ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400/50 shadow-md ring-1 ring-amber-400/20'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold truncate">
                            {tender.authority || 'CPWD'}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {tender.nitNumber || 'NIT'}
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                          {tender.originalFileName || tender.title}
                        </h3>
                      </div>

                      {/* Delete icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmTender(tender);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                        title="Remove document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{tender.pageCount || 1} Pages</span>
                        {tender.fileSize && (
                          <span className="text-slate-500">
                            · {(tender.fileSize / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        )}
                      </div>

                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Privacy & Zero-Trust Notice */}
          <div className="p-2.5 border-t border-slate-800 bg-[#0B0F17]/90 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Isolated Workspace (UID: {user?.uid.slice(0, 6)}...)</span>
          </div>
        </div>

        {/* Chat Interface Panel (Right Main Canvas) */}
        <div className="flex-1 flex flex-col bg-[#0E1726] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
          {/* Active Document Header */}
          {activeTender ? (
            <div className="p-3.5 border-b border-slate-800 bg-[#0B0F17]/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {activeTender.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                      {activeTender.nitNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>Est. Cost: {formatCurrency(activeTender.estimatedCost, activeTender.currency)}</span>
                    <span className="text-slate-600">·</span>
                    <span>Pages: {activeTender.pageCount || 1}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400">Ready for Questions</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  disabled={messages.length === 0}
                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 border border-slate-700 rounded text-xs flex items-center gap-1.5 font-mono transition-colors"
                  title="Clear conversation and start new session"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-800 bg-[#0B0F17]/70 text-xs font-mono text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>No tender selected. Please select a document from the left panel or upload a new PDF.</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto py-6 space-y-6">
                <div className="p-5 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>Welcome to TenderAI Chat Assistant</span>
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Ask any civil engineering or contract question regarding{' '}
                        <strong className="text-amber-300">
                          {activeTender?.title || 'your uploaded tender'}
                        </strong>. 
                        Answers are generated using Retrieval-Augmented Generation (RAG) strictly grounded in the document text with page citations.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-4 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Zero Hallucination Policy
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      Source Page Citations
                    </span>
                  </div>
                </div>

                {/* Suggested Questions (Clickable) */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>SUGGESTED TENDER INQUIRIES:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(question)}
                        disabled={!activeTender || isSending}
                        className="p-3 text-left bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 rounded-lg text-xs text-slate-200 transition-all group flex items-start justify-between gap-2 disabled:opacity-50"
                      >
                        <span className="leading-snug">{question}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render Conversation Messages */}
            {messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                      <HardHat className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`
                      p-4 rounded-xl text-xs space-y-2.5 max-w-2xl
                      ${
                        isUser
                          ? 'bg-amber-400/15 border border-amber-400/30 text-slate-100 rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                      }
                    `}
                  >
                    {/* Header Label */}
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800/60">
                      <span className="font-semibold text-slate-300">
                        {isUser ? 'Civil Engineer (You)' : 'TenderAI Grounded Engine'}
                      </span>
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap leading-relaxed space-y-2 font-sans text-[13px]">
                      {message.text}
                    </div>

                    {/* Grounded Source Citations */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>GROUNDED SOURCE CITATIONS:</span>
                        </div>

                        <div className="space-y-1.5">
                          {message.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1"
                            >
                              <div className="flex items-center justify-between text-cyan-300">
                                <span>📄 Source Page: {src.pageNumber}</span>
                                {src.relevanceScore && (
                                  <span className="text-[10px] text-slate-500">
                                    Relevance: {src.relevanceScore}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 italic font-sans text-[11px] line-clamp-3">
                                &ldquo;{src.excerpt}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Answering Loading State */}
            {isSending && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-7 h-7 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                  <HardHat className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 rounded-tl-none shadow-md text-xs space-y-2 max-w-md">
                  <div className="flex items-center gap-2 text-amber-400 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching tender document &amp; synthesizing answer...</span>
                  </div>
                  <div className="space-y-1.5 pt-1 animate-pulse">
                    <div className="h-2 bg-slate-800 rounded w-full" />
                    <div className="h-2 bg-slate-800 rounded w-5/6" />
                    <div className="h-2 bg-slate-800 rounded w-4/6" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-[#0B0F17]/90 space-y-2 shrink-0">
            {chatError && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{chatError}</span>
                </div>
                <button
                  onClick={() => setChatError(null)}
                  className="text-rose-400 hover:text-rose-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!activeTender || isSending}
                  placeholder={
                    activeTender
                      ? `Ask questions about ${activeTender.nitNumber || 'this tender'} (Press Enter to send, Shift+Enter for new line)...`
                      : 'Please upload or select a tender document to begin chatting.'
                  }
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-sans leading-relaxed disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || !activeTender || isSending}
                className="py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0 h-[46px]"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>Shift + Enter for multi-line · Grounded strictly in selected PDF</span>
              <span>Model: gemini-3.8-flash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0E1726] border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Delete Tender Document?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-200">
                    {deleteConfirmTender.title || deleteConfirmTender.nitNumber}
                  </strong>
                  ? This will also remove all indexed chunks and conversation history. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmTender(null)}
                disabled={isDeleting}
                className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTender}
                disabled={isDeleting}
                className="py-1.5 px-3 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
