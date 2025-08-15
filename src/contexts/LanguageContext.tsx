import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ru' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'medical_form': 'Medical Form',
    'step_complete': 'Step {{step}} of 3: Complete all sections to generate your PDF report',
    
    // Step 1
    'personal_information': 'Personal Information',
    'personal_info_desc': 'Please provide your personal and contact details',
    'consultant_name': 'Consultant Name',
    'patient_name': 'Patient Name',
    'phone_number': 'Phone Number',
    'patient_id': 'Patient ID',
    'entry_date': 'Entry Date',
    'age': 'Age',
    'currency': 'Currency',
    'language': 'Language',
    'health_condition': 'Health Condition',
    'services': 'Services',
    
    // Step 2
    'medical_visits': 'Medical Visits',
    'medical_visits_desc': 'Please provide medical visit details and service information',
    'first_visit': 'First Visit',
    'second_visit': 'Second Visit',
    'visit_date': 'Visit Date',
    'visit_days': 'Visit Days',
    'add_service_entry': 'Add Service Entry',
    'service_name': 'Service Name',
    'service_type': 'Service Type',
    'price': 'Price',
    'quantity': 'Quantity',
    'add_entry': 'Add Entry',
    'service_entries': 'Service Entries',
    'total': 'Total',
    'action': 'Action',
    'total_entries': 'Total entries',
    'enable_second_visit': 'Enable Second Visit (optional)',
    
    // Step 3
    'additional_information': 'Additional Information',
    'additional_info_desc': 'Upload images and add any additional notes or comments',
    'upload_images': 'Upload Images',
    'uploaded': 'uploaded',
    'remaining': 'remaining',
    'limit_reached': 'limit reached',
    'upload_limit_reached': 'Upload limit reached',
    'click_to_upload': 'Click to upload images',
    'jpg_png_only': 'JPG, JPEG, or PNG files only (max {{max}})',
    'uploaded_images': 'Uploaded Images',
    'medical_treatment_plan': 'Medical treatment plan',
    'medical_notes': 'Medical notes',
    'treatment_plan_placeholder': 'Enter the medical treatment plan details...',
    'medical_notes_placeholder': 'Enter medical notes and observations...',
    
    // PDF Export
    'pdf_export_language': 'PDF Export Language',
    'pdf_language_description': 'Select the language for the generated PDF report',
    'select_pdf_language': 'PDF Language',
    
    // Navigation
    'previous': 'Previous',
    'next': 'Next',
    'generate_pdf': 'Generate PDF',
    'generating_pdf': 'Generating PDF...',
    
    // Success
    'pdf_generated_success': 'PDF Generated Successfully!',
    'pdf_generated_desc': 'Your medical form has been generated and downloaded.',
    
    // Options
    'euro': 'Euro (€)',
    'us_dollar': 'US Dollar ($)',
    'british_pound': 'British Pound (£)',
    'canadian_dollar': 'Canadian Dollar (C$)',
    'arabic': 'Arabic',
    'english': 'English',
    'french': 'French',
    'spanish': 'Spanish',
    'turkish': 'Turkish',
    'russian': 'Russian',
    'other': 'Other',
    'good': 'Good',
    'requires_report': 'Requires medical report',
    'dental': 'Dental',
    'hollywood_smile': 'Hollywood Smile',
    'dental_implant': 'Dental Implant',
    'zirconium_crown': 'Zirconium Crown',
    'open_sinus_lift': 'Open Sinus Lift',
    'close_sinus_lift': 'Close Sinus Lift',
    'veneer_lens': 'Veneer Lens',
    'hotel_accommodation': 'Hotel Accommodation',
    'transport': 'Transport',
    
    // Placeholders
    'enter_consultant_name': 'Enter consultant name',
    'enter_patient_name': 'Enter patient name',
    'enter_patient_id': 'Enter patient ID',
    'enter_age': 'Enter age',
    'days_until_visit': 'Days until visit',
    'select_service': 'Select service',
    'enter_service_type': 'Enter service type',
    'enter_price': 'Enter price',
    'enter_quantity': 'Enter quantity',
    'select': 'Select',
    
    // Errors
    'consultant_name_required': 'Consultant name is required',
    'patient_name_required': 'Patient name is required',
    'phone_number_required': 'Phone number is required',
    'patient_id_required': 'Patient ID is required',
    'entry_date_required': 'Entry date is required',
    'age_required': 'Age is required',
    'currency_required': 'Currency is required',
    'language_required': 'Language is required',
    'health_condition_required': 'Health condition is required',
    'services_required': 'Services is required',
    'first_visit_date_required': 'First visit date is required',
    'first_visit_days_required': 'First visit days is required',
    'second_visit_date_required': 'Second visit date is required',
    'second_visit_days_required': 'Second visit days is required',
    'first_visit_days_positive': 'First visit days must be > 0',
    'second_visit_days_positive': 'Second visit days must be > 0',
  },
  
  ru: {
    // Header
    'medical_form': 'Медицинская форма',
    'step_complete': 'Шаг {{step}} из 3: Заполните все разделы для создания PDF отчета',
    
    // Step 1
    'personal_information': 'Личная информация',
    'personal_info_desc': 'Пожалуйста, предоставьте ваши личные и контактные данные',
    'consultant_name': 'Имя консультанта',
    'patient_name': 'Имя пациента',
    'phone_number': 'Номер телефона',
    'patient_id': 'ID пациента',
    'entry_date': 'Дата поступления',
    'age': 'Возраст',
    'currency': 'Валюта',
    'language': 'Язык',
    'health_condition': 'Состояние здоровья',
    'services': 'Услуги',
    
    // Step 2
    'medical_visits': 'Медицинские визиты',
    'medical_visits_desc': 'Пожалуйста, предоставьте детали медицинских визитов и информацию об услугах',
    'first_visit': 'Первый визит',
    'second_visit': 'Второй визит',
    'visit_date': 'Дата визита',
    'visit_days': 'Дни визита',
    'add_service_entry': 'Добавить запись услуги',
    'service_name': 'Название услуги',
    'service_type': 'Тип услуги',
    'price': 'Цена',
    'quantity': 'Количество',
    'add_entry': 'Добавить запись',
    'service_entries': 'Записи услуг',
    'total': 'Итого',
    'action': 'Действие',
    'total_entries': 'Всего записей',
    'enable_second_visit': 'Включить второй визит (необязательно)',
    
    // Step 3
    'additional_information': 'Дополнительная информация',
    'additional_info_desc': 'Загрузите изображения и добавьте дополнительные заметки или комментарии',
    'upload_images': 'Загрузить изображения',
    'uploaded': 'загружено',
    'remaining': 'осталось',
    'limit_reached': 'лимит достигнут',
    'upload_limit_reached': 'Лимит загрузки достигнут',
    'click_to_upload': 'Нажмите для загрузки изображений',
    'jpg_png_only': 'Только файлы JPG, JPEG или PNG (макс {{max}})',
    'uploaded_images': 'Загруженные изображения',
    'medical_treatment_plan': 'План медицинского лечения',
    'medical_notes': 'Медицинские заметки',
    'treatment_plan_placeholder': 'Введите детали плана медицинского лечения...',
    'medical_notes_placeholder': 'Введите медицинские заметки и наблюдения...',
    
    // PDF Export
    'pdf_export_language': 'Язык экспорта PDF',
    'pdf_language_description': 'Выберите язык для создаваемого PDF отчета',
    'select_pdf_language': 'Язык PDF',
    
    // Navigation
    'previous': 'Назад',
    'next': 'Далее',
    'generate_pdf': 'Создать PDF',
    'generating_pdf': 'Создание PDF...',
    
    // Success
    'pdf_generated_success': 'PDF успешно создан!',
    'pdf_generated_desc': 'Ваша медицинская форма была создана и загружена.',
    
    // Options
    'euro': 'Евро (€)',
    'us_dollar': 'Доллар США ($)',
    'british_pound': 'Британский фунт (£)',
    'canadian_dollar': 'Канадский доллар (C$)',
    'arabic': 'Арабский',
    'english': 'Английский',
    'french': 'Французский',
    'spanish': 'Испанский',
    'turkish': 'Турецкий',
    'russian': 'Русский',
    'other': 'Другой',
    'good': 'Хорошее',
    'requires_report': 'Требует медицинского заключения',
    'dental': 'Стоматология',
    'hollywood_smile': 'Голливудская улыбка',
    'dental_implant': 'Зубной имплант',
    'zirconium_crown': 'Циркониевая коронка',
    'open_sinus_lift': 'Открытый синус-лифтинг',
    'close_sinus_lift': 'Закрытый синус-лифтинг',
    'veneer_lens': 'Виниры',
    'hotel_accommodation': 'Размещение в отеле',
    'transport': 'Транспорт',
    
    // Placeholders
    'enter_consultant_name': 'Введите имя консультанта',
    'enter_patient_name': 'Введите имя пациента',
    'enter_patient_id': 'Введите ID пациента',
    'enter_age': 'Введите возраст',
    'days_until_visit': 'Дни до визита',
    'select_service': 'Выберите услугу',
    'enter_service_type': 'Введите тип услуги',
    'enter_price': 'Введите цену',
    'enter_quantity': 'Введите количество',
    'select': 'Выбрать',
    
    // Errors
    'consultant_name_required': 'Имя консультанта обязательно',
    'patient_name_required': 'Имя пациента обязательно',
    'phone_number_required': 'Номер телефона обязателен',
    'patient_id_required': 'ID пациента обязателен',
    'entry_date_required': 'Дата поступления обязательна',
    'age_required': 'Возраст обязателен',
    'currency_required': 'Валюта обязательна',
    'language_required': 'Язык обязателен',
    'health_condition_required': 'Состояние здоровья обязательно',
    'services_required': 'Услуги обязательны',
    'first_visit_date_required': 'Дата первого визита обязательна',
    'first_visit_days_required': 'Дни первого визита обязательны',
    'second_visit_date_required': 'Дата второго визита обязательна',
    'second_visit_days_required': 'Дни второго визита обязательны',
    'first_visit_days_positive': 'Дни первого визита должны быть > 0',
    'second_visit_days_positive': 'Дни второго визита должны быть > 0',
  },
  
  fr: {
    // Header
    'medical_form': 'Formulaire médical',
    'step_complete': 'Étape {{step}} sur 3: Complétez toutes les sections pour générer votre rapport PDF',
    
    // Step 1
    'personal_information': 'Informations personnelles',
    'personal_info_desc': 'Veuillez fournir vos informations personnelles et de contact',
    'consultant_name': 'Nom du consultant',
    'patient_name': 'Nom du patient',
    'phone_number': 'Numéro de téléphone',
    'patient_id': 'ID du patient',
    'entry_date': "Date d'entrée",
    'age': 'Âge',
    'currency': 'Devise',
    'language': 'Langue',
    'health_condition': 'État de santé',
    'services': 'Services',
    
    // Step 2
    'medical_visits': 'Visites médicales',
    'medical_visits_desc': 'Veuillez fournir les détails des visites médicales et les informations sur les services',
    'first_visit': 'Première visite',
    'second_visit': 'Deuxième visite',
    'visit_date': 'Date de visite',
    'visit_days': 'Jours de visite',
    'add_service_entry': 'Ajouter une entrée de service',
    'service_name': 'Nom du service',
    'service_type': 'Type de service',
    'price': 'Prix',
    'quantity': 'Quantité',
    'add_entry': 'Ajouter une entrée',
    'service_entries': 'Entrées de service',
    'total': 'Total',
    'action': 'Action',
    'total_entries': 'Total des entrées',
    'enable_second_visit': 'Activer la deuxième visite (optionnel)',
    
    // Step 3
    'additional_information': 'Informations supplémentaires',
    'additional_info_desc': 'Téléchargez des images et ajoutez des notes ou commentaires supplémentaires',
    'upload_images': 'Télécharger des images',
    'uploaded': 'téléchargé',
    'remaining': 'restant',
    'limit_reached': 'limite atteinte',
    'upload_limit_reached': 'Limite de téléchargement atteinte',
    'click_to_upload': 'Cliquez pour télécharger des images',
    'jpg_png_only': 'Fichiers JPG, JPEG ou PNG uniquement (max {{max}})',
    'uploaded_images': 'Images téléchargées',
    'medical_treatment_plan': 'Plan de traitement médical',
    'medical_notes': 'Notes médicales',
    'treatment_plan_placeholder': 'Entrez les détails du plan de traitement médical...',
    'medical_notes_placeholder': 'Entrez les notes médicales et observations...',
    
    // PDF Export
    'pdf_export_language': 'Langue d\'exportation PDF',
    'pdf_language_description': 'Sélectionnez la langue pour le rapport PDF généré',
    'select_pdf_language': 'Langue PDF',
    
    // Navigation
    'previous': 'Précédent',
    'next': 'Suivant',
    'generate_pdf': 'Générer PDF',
    'generating_pdf': 'Génération du PDF...',
    
    // Success
    'pdf_generated_success': 'PDF généré avec succès!',
    'pdf_generated_desc': 'Votre formulaire médical a été généré et téléchargé.',
    
    // Options
    'euro': 'Euro (€)',
    'us_dollar': 'Dollar américain ($)',
    'british_pound': 'Livre sterling (£)',
    'canadian_dollar': 'Dollar canadien (C$)',
    'arabic': 'Arabe',
    'english': 'Anglais',
    'french': 'Français',
    'spanish': 'Espagnol',
    'turkish': 'Turc',
    'russian': 'Russe',
    'other': 'Autre',
    'good': 'Bon',
    'requires_report': 'Nécessite un rapport médical',
    'dental': 'Dentaire',
    'hollywood_smile': 'Sourire hollywoodien',
    'dental_implant': 'Implant dentaire',
    'zirconium_crown': 'Couronne en zirconium',
    'open_sinus_lift': 'Sinus lift ouvert',
    'close_sinus_lift': 'Sinus lift fermé',
    'veneer_lens': 'Facettes',
    'hotel_accommodation': "Hébergement à l'hôtel",
    'transport': 'Transport',
    
    // Placeholders
    'enter_consultant_name': 'Entrez le nom du consultant',
    'enter_patient_name': 'Entrez le nom du patient',
    'enter_patient_id': 'Entrez l\'ID du patient',
    'enter_age': 'Entrez l\'âge',
    'days_until_visit': 'Jours jusqu\'à la visite',
    'select_service': 'Sélectionnez un service',
    'enter_service_type': 'Entrez le type de service',
    'enter_price': 'Entrez le prix',
    'enter_quantity': 'Entrez la quantité',
    'select': 'Sélectionner',
    
    // Errors
    'consultant_name_required': 'Le nom du consultant est requis',
    'patient_name_required': 'Le nom du patient est requis',
    'phone_number_required': 'Le numéro de téléphone est requis',
    'patient_id_required': 'L\'ID du patient est requis',
    'entry_date_required': 'La date d\'entrée est requise',
    'age_required': 'L\'âge est requis',
    'currency_required': 'La devise est requise',
    'language_required': 'La langue est requise',
    'health_condition_required': 'L\'état de santé est requis',
    'services_required': 'Les services sont requis',
    'first_visit_date_required': 'La date de la première visite est requise',
    'first_visit_days_required': 'Les jours de la première visite sont requis',
    'second_visit_date_required': 'La date de la deuxième visite est requise',
    'second_visit_days_required': 'Les jours de la deuxième visite sont requis',
    'first_visit_days_positive': 'Les jours de la première visite doivent être > 0',
    'second_visit_days_positive': 'Les jours de la deuxième visite doivent être > 0',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};