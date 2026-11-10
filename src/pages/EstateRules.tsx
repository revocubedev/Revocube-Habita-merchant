import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { estateRuleUrl, useGetEstateRules, useUploadEstateRules } from '@/api/api_controllers/estateRules';

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const EstateRules = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const { data: rulesData, isLoading: isLoadingRules, isError: isRulesError } = useGetEstateRules();
  const { uploadEstateRules, isLoading: isUploading } = useUploadEstateRules();

  console.log('rulesData', rulesData);

  useEffect(() => {
    const rule = rulesData?.data?.[0];
    const url = estateRuleUrl(rule);
    if (!url || objectUrlRef.current) return;
    setPdfFile(url);
    setUploadedFileName(rule?.name ?? url.split('/').pop()?.split('?')[0] ?? 'Estate Rules.pdf');
  }, [rulesData]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Please select a PDF document.');
      return;
    }
    setUploadError('');
    try {
      await uploadEstateRules(file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(file);
      setPdfFile(objectUrlRef.current);
      setUploadedFileName(file.name);
      setPageNumber(1);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload the rules document.');
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  return (
    <div className="space-y-4">
      {/* Main Heading */}
      <h1 className="text-2xl font-display font-semibold text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 600, color: '#393939' }}>
        Estate Rules
      </h1>

      {/* Section Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-display font-medium text-foreground" style={{ fontFamily: 'Poppins', fontWeight: 500, color: '#4c4c4c' }}>
          Estate Rules
        </h2>
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="text-sm text-white transition-colors flex items-center gap-2 px-4 py-2"
          style={{ 
            fontFamily: 'Poppins', 
            borderRadius: '8px', 
            backgroundColor: '#f30100',
            border: 'none'
          }}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload New Rules'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadError && <p role="alert" className="text-sm text-red-600">{uploadError}</p>}

      {/* PDF Viewer Container */}
      <div 
        className="rounded-lg"
        style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          minHeight: '600px'
        }}
      >
        {pdfFile ? (
          <div className="bg-[#1e1e1e] rounded-lg overflow-hidden" style={{ minHeight: '560px' }}>
            {/* PDF Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-300">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Poppins' }}>
                  {uploadedFileName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins' }}>
                  Page {pageNumber} of {numPages}
                </span>
              </div>
            </div>

            {/* PDF Viewer with Thumbnails */}
            <div className="flex" style={{ height: '500px' }}>
              {/* Thumbnail Sidebar */}
              <div className="w-48 bg-[#2d2d2d] overflow-y-auto p-2 space-y-2">
                {Array.from({ length: Math.min(numPages, 10) }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => setPageNumber(i + 1)}
                    className={`cursor-pointer rounded p-1 transition-colors ${
                      pageNumber === i + 1 ? 'bg-[#404040]' : 'hover:bg-[#383838]'
                    }`}
                  >
                    <div className="bg-white rounded mb-1" style={{ height: '60px' }}>
                      <Page 
                        pageNumber={i + 1} 
                        scale={0.2}
                        width={180}
                        loading={<div className="h-full flex items-center justify-center text-xs text-gray-500">Loading...</div>}
                      />
                    </div>
                    <div className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Poppins' }}>
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Main PDF Canvas */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e] flex items-center justify-center p-4">
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="text-white">Loading PDF...</div>}
                  error={<div className="text-white">Error loading PDF</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale}
                    loading={<div className="text-white">Loading page...</div>}
                  />
                </Document>
              </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={pageNumber <= 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm" style={{ fontFamily: 'Poppins' }}>
                  {pageNumber}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm" style={{ fontFamily: 'Poppins' }}>
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center bg-[#1e1e1e] rounded-lg" style={{ minHeight: '560px' }}>
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-white text-lg mb-2" style={{ fontFamily: 'Poppins' }}>
              {isLoadingRules ? 'Loading estate rules...' : isRulesError ? 'Could not load estate rules' : 'No estate rules document uploaded'}
            </p>
            <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: 'Poppins' }}>
              {isRulesError ? 'Please try again later.' : 'Upload a PDF file to display the estate rules'}
            </p>
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="text-white transition-colors flex items-center gap-2 px-4 py-2"
              style={{ 
                fontFamily: 'Poppins', 
                borderRadius: '8px', 
                backgroundColor: '#f30100',
                border: 'none'
              }}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstateRules;
