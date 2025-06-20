import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onUpload: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      
      // プレビュー画像を作成
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* ドラッグ&ドロップ領域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-medical-500 bg-medical-50'
            : isDragReject
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-medical-400 hover:bg-medical-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-medical-700">
                ここにファイルをドロップしてください
              </p>
            </div>
          ) : isDragReject ? (
            <div>
              <p className="text-lg font-medium text-red-700">
                対応していないファイル形式です
              </p>
              <p className="text-sm text-red-600">
                JPEG、PNG形式のファイルをアップロードしてください
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">
                口腔内写真をアップロードしてください
              </p>
              <p className="text-sm text-gray-500">
                ファイルをドラッグ&ドロップするか、クリックして選択してください
              </p>
              <p className="text-xs text-gray-400">
                対応形式: JPEG, PNG | 最大サイズ: 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* プレビュー */}
      {preview && (
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={preview}
                alt="アップロード画像のプレビュー"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                アップロード予定の画像
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">ファイル名:</span> {selectedFile?.name}</p>
                <p><span className="font-medium">サイズ:</span> {(selectedFile?.size || 0 / (1024 * 1024)).toFixed(2)} MB</p>
                <p><span className="font-medium">形式:</span> {selectedFile?.type}</p>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleUpload}
                  className="btn-primary"
                >
                  解析を開始
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  別の画像を選択
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};