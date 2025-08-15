import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isValid: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  isValid
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-600">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          currentStep === 1
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-600 text-gray-200 hover:bg-gray-500 hover:shadow-md'
        }`}
      >
        <ChevronLeft size={20} />
        {t('previous')}
      </button>

      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i + 1 <= currentStep
                ? 'bg-blue-400 shadow-lg shadow-blue-400/20'
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {currentStep === totalSteps ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isValid
              ? 'bg-green-600 text-white hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/20'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
          {t('generate_pdf')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('next')}
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default StepNavigation;