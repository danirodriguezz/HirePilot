import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';

// ==========================================
// 1. REGISTRO DE FUENTES (Mantenido igual)
// ==========================================
import RobotoRegular from '../../assets/fonts/Roboto/roboto-v50-latin-regular.ttf';
import RobotoItalic from '../../assets/fonts/Roboto/roboto-v50-latin-italic.ttf';
import RobotoMedium from '../../assets/fonts/Roboto/roboto-v50-latin-500.ttf';
import RobotoBold from '../../assets/fonts/Roboto/roboto-v50-latin-700.ttf';

import MerriweatherRegular from '../../assets/fonts/Merriweather/merriweather-v33-latin-regular.ttf';
import MerriweatherItalic from '../../assets/fonts/Merriweather/merriweather-v33-latin-italic.ttf';
import MerriweatherBold from '../../assets/fonts/Merriweather/merriweather-v33-latin-700.ttf';

import LatoRegular from '../../assets/fonts/Lato/lato-v25-latin-regular.ttf';
import LatoBold from '../../assets/fonts/Lato/lato-v25-latin-700.ttf';

Font.register({ family: 'Roboto', fonts: [ { src: RobotoRegular, fontWeight: 400 }, { src: RobotoItalic, fontWeight: 400, fontStyle: 'italic' }, { src: RobotoMedium, fontWeight: 500 }, { src: RobotoBold, fontWeight: 700 }, ] });
Font.register({ family: 'Merriweather', fonts: [ { src: MerriweatherRegular, fontWeight: 400 }, { src: MerriweatherItalic, fontWeight: 400, fontStyle: 'italic' }, { src: MerriweatherBold, fontWeight: 700 }, ] });
Font.register({ family: 'Lato', fonts: [ { src: LatoRegular, fontWeight: 400 }, { src: LatoBold, fontWeight: 700 }, ] });

// ==========================================
// 2. DICCIONARIO DE TRADUCCIONES (NUEVO)
// ==========================================
const TRANSLATIONS = {
  es: {
    contact: 'Contacto',
    skills: 'Habilidades',
    languages: 'Idiomas',
    experience: 'Experiencia Laboral',
    education: 'Educación',
    present: 'Presente',
    profile: 'Perfil Profesional',
    aboutMe: 'Sobre mí',
    competences: 'Competencias'
  },
  en: {
    contact: 'Contact',
    skills: 'Skills',
    languages: 'Languages',
    experience: 'Work Experience',
    education: 'Education',
    present: 'Present',
    profile: 'Professional Profile',
    aboutMe: 'About Me',
    competences: 'Competences'
  },
  fr: {
    contact: 'Contact',
    skills: 'Compétences',
    languages: 'Langues',
    experience: 'Expérience Professionnelle',
    education: 'Éducation',
    present: 'Présent',
    profile: 'Profil Professionnel',
    aboutMe: 'À propos de moi',
    competences: 'Compétences'
  }
};

// ==========================================
// 3. UTILIDADES Y HELPERS (ACTUALIZADOS)
// ==========================================

// Añadimos el parámetro de idioma para usar el Locale nativo de JS
const formatDate = (dateString, lang = 'es') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; 
  
  const locales = { es: 'es-ES', en: 'en-US', fr: 'fr-FR' };
  return date.toLocaleDateString(locales[lang] || 'es-ES', { month: 'short', year: 'numeric' });
};

const parseDateRange = (dateRangeString) => {
  if (!dateRangeString) return { startDate: null, endDate: null, current: false };
  
  const parts = dateRangeString.split(' - ');
  const startDate = parts[0] ? parts[0].trim() : null;
  const endDateRaw = parts[1] ? parts[1].trim() : null;
  
  // Ampliado para detectar la palabra "presente" en cualquier idioma que responda la IA
  const isCurrent = endDateRaw?.toLowerCase().includes('present') || 
                    endDateRaw?.toLowerCase().includes('actualidad') ||
                    endDateRaw?.toLowerCase().includes('présent');

  return {
    startDate,
    endDate: isCurrent ? null : endDateRaw,
    current: isCurrent
  };
};

// ==========================================
// 4. LAYOUTS (ACTUALIZADOS PARA USAR TRADUCCIÓN)
// ==========================================

// --- TEMPLATE 1: MODERNO ---
const ModernLayout = ({ data, t, lang }) => {
  const styles = StyleSheet.create({
    page: { flexDirection: 'row', fontFamily: 'Roboto' },
    sidebar: { width: '35%', backgroundColor: '#1F2937', padding: 20, color: 'white', height: '100%' },
    main: { width: '65%', padding: 20 },
    name: { fontSize: 24, fontWeight: 700, marginBottom: 5, color: '#10B981' },
    role: { fontSize: 14, marginBottom: 20, color: '#D1D5DB' },
    sectionTitleSidebar: { fontSize: 12, fontWeight: 700, borderBottom: '1px solid #4B5563', paddingBottom: 5, marginBottom: 10, marginTop: 15, textTransform: 'uppercase', color: '#10B981' },
    sectionTitleMain: { fontSize: 16, fontWeight: 700, borderBottom: '2px solid #E5E7EB', paddingBottom: 5, marginBottom: 15, color: '#111827', textTransform: 'uppercase' },
    textSidebar: { fontSize: 10, marginBottom: 5, color: '#E5E7EB' },
    textMain: { fontSize: 11, marginBottom: 5, color: '#374151', lineHeight: 1.4 },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    jobTitle: { fontWeight: 700, fontSize: 12 },
    company: { fontStyle: 'italic', fontSize: 11 },
    date: { fontSize: 10, color: '#6B7280' },
  });

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.sidebar}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{t.contact}</Text>
          <Text style={styles.textSidebar}>{data.profile.email}</Text>
          <Text style={styles.textSidebar}>{data.profile.phone}</Text>
          <Text style={styles.textSidebar}>{data.profile.location}</Text>
          {data.profile.linkedin && <Link src={data.profile.linkedin} style={styles.textSidebar}>LinkedIn</Link>}
        </View>

        <Text style={styles.sectionTitleSidebar}>{t.skills}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {data.skills?.technical?.map((skill, i) => (
                <Text key={i} style={{...styles.textSidebar, backgroundColor: '#374151', padding: '3 6', borderRadius: 4, fontSize: 9}}>{skill}</Text>
            ))}
        </View>

        <Text style={styles.sectionTitleSidebar}>{t.languages}</Text>
        {data.languages?.map((langItem, i) => (
          <Text key={i} style={styles.textSidebar}>• {langItem.name} ({langItem.level})</Text>
        ))}
      </View>

      <View style={styles.main}>
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.name}>{data.profile.firstName} {data.profile.lastName}</Text>
            <Text style={styles.role}>{data.job_title_target || data.profile.profession}</Text>
            <Text style={styles.textMain}>{data.profile.summary}</Text>
        </View>

        <Text style={styles.sectionTitleMain}>{t.experience}</Text>
        {data.experience?.map((exp, i) => (
          <View key={i} style={{ marginBottom: 15 }} wrap={false}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
              <Text style={styles.date}>{formatDate(exp.startDate, lang)} - {exp.current ? t.present : formatDate(exp.endDate, lang)}</Text>
            </View>
            <Text style={styles.company}>{exp.company}</Text>
            <Text style={{...styles.textMain, marginTop: 5}}>{exp.description}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitleMain}>{t.education}</Text>
        {data.education?.map((edu, i) => (
           <View key={i} style={{ marginBottom: 8 }} wrap={false}>
             <Text style={{ fontWeight: 700, fontSize: 11 }}>{edu.degree}</Text>
             <Text style={styles.textMain}>{edu.institution} | {formatDate(edu.startDate, lang)}</Text>
           </View>
        ))}
      </View>
    </Page>
  );
};

// --- TEMPLATE 2: CLÁSICO ---
const ClassicLayout = ({ data, t, lang }) => {
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Merriweather', fontSize: 11, lineHeight: 1.5 },
    header: { textAlign: 'center', marginBottom: 20, borderBottom: '1px solid #000', paddingBottom: 20 },
    name: { fontSize: 24, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' },
    contactInfo: { flexDirection: 'row', justifyContent: 'center', gap: 15, fontSize: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 700, borderBottom: '1px solid #ccc', marginTop: 15, marginBottom: 10, textTransform: 'uppercase', paddingBottom: 2 },
    jobBlock: { marginBottom: 15 },
    jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 3 },
    jobTitle: { fontSize: 12, fontWeight: 700 },
    company: { fontSize: 11, fontStyle: 'italic' },
    date: { fontSize: 10 },
  });

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{data.profile.firstName} {data.profile.lastName}</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>{data.job_title_target || data.profile.profession}</Text>
        <View style={styles.contactInfo}>
          <Text>{data.profile.email}</Text>
          <Text>|</Text>
          <Text>{data.profile.phone}</Text>
          <Text>|</Text>
          <Text>{data.profile.location}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t.profile}</Text>
      <Text style={{ marginBottom: 10, textAlign: 'justify' }}>{data.profile.summary}</Text>

      <Text style={styles.sectionTitle}>{t.experience}</Text>
      {data.experience?.map((exp, i) => (
        <View key={i} style={styles.jobBlock} wrap={false}>
          <View style={styles.jobRow}>
            <View>
                <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={styles.company}>{exp.company}</Text>
            </View>
            <Text style={styles.date}>{formatDate(exp.startDate, lang)} — {exp.current ? t.present : formatDate(exp.endDate, lang)}</Text>
          </View>
          <Text style={{ fontSize: 10, textAlign: 'justify' }}>{exp.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>{t.education}</Text>
      {data.education?.map((edu, i) => (
          <View key={i} style={styles.jobRow} wrap={false}>
              <Text style={{ fontWeight: 700 }}>{edu.degree}, {edu.institution}</Text>
              <Text style={styles.date}>{formatDate(edu.startDate, lang)}</Text>
          </View>
      ))}
      
      <Text style={styles.sectionTitle}>{t.competences}</Text>
      <Text style={{ fontSize: 10 }}>{data.skills?.technical?.join(' • ')}</Text>
    </Page>
  );
};

// --- TEMPLATE 3: CREATIVO ---
const CreativeLayout = ({ data, t, lang }) => {
    const styles = StyleSheet.create({
      page: { fontFamily: 'Lato', backgroundColor: '#F9FAFB' },
      header: { backgroundColor: '#3B82F6', padding: 30, color: 'white' },
      name: { fontSize: 30, fontWeight: 900 },
      role: { fontSize: 16, marginTop: 5, opacity: 0.9 },
      contentContainer: { flexDirection: 'row', padding: 30 },
      leftCol: { width: '65%', paddingRight: 20 },
      rightCol: { width: '35%', paddingLeft: 20, borderLeft: '1px solid #E5E7EB' },
      sectionTitle: { fontSize: 14, fontWeight: 700, color: '#3B82F6', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
      text: { fontSize: 10, color: '#4B5563', marginBottom: 5, lineHeight: 1.4 },
      itemTitle: { fontSize: 11, fontWeight: 700, color: '#111827' },
      tag: { backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: 9, padding: '4 8', borderRadius: 10, alignSelf: 'flex-start', marginBottom: 4, marginRight: 4 }
    });
  
    return (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.profile.firstName} {data.profile.lastName}</Text>
          <Text style={styles.role}>{data.job_title_target || data.profile.profession}</Text>
          <View style={{ flexDirection: 'row', marginTop: 15, gap: 15, fontSize: 10, opacity: 0.9 }}>
              <Text>{data.profile.email}</Text>
              <Text>{data.profile.phone}</Text>
              <Text>{data.profile.location}</Text>
          </View>
        </View>
  
        <View style={styles.contentContainer}>
          <View style={styles.leftCol}>
            <Text style={styles.sectionTitle}>{t.aboutMe}</Text>
            <Text style={{...styles.text, marginBottom: 20}}>{data.profile.summary}</Text>
  
            <Text style={styles.sectionTitle}>{t.experience}</Text>
            {data.experience?.map((exp, i) => (
              <View key={i} style={{ marginBottom: 20 }} wrap={false}>
                <Text style={styles.itemTitle}>{exp.jobTitle}</Text>
                <Text style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{exp.company} | {formatDate(exp.startDate, lang)} - {exp.current ? t.present : formatDate(exp.endDate, lang)}</Text>
                <Text style={styles.text}>{exp.description}</Text>
              </View>
            ))}
          </View>
  
          <View style={styles.rightCol}>
            <Text style={styles.sectionTitle}>{t.skills}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                {data.skills?.technical?.map((skill, i) => (
                    <Text key={i} style={styles.tag}>{skill}</Text>
                ))}
            </View>
  
            <Text style={styles.sectionTitle}>{t.education}</Text>
            {data.education?.map((edu, i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.text}>{edu.institution}</Text>
                </View>
            ))}
          </View>
        </View>
      </Page>
    );
  };

// ==========================================
// 5. COMPONENTE PRINCIPAL (ADAPTER + RENDER)
// ==========================================

// AÑADIMOS 'language' CON VALOR 'es' POR DEFECTO
export const CVDocument = ({ data, template = 'modern', language = 'es' }) => {
  
  // Obtenemos el diccionario del idioma activo
  const t = TRANSLATIONS[language] || TRANSLATIONS['es'];

  // A. ADAPTER: Normalizamos los datos (Backend -> Frontend)
  const source = data?.structured_cv_data ? data.structured_cv_data : (data || {});
  
  const mappedData = {
    profile: {
      firstName: source.profile?.firstName || '',
      lastName: source.profile?.lastName || '',
      email: source.profile?.email || '',
      phone: source.profile?.phone || '',
      linkedin: source.profile?.linkedin || '',
      location: source.profile?.location || '',
      profession: source.profile?.profession || '',
      summary: source.profile_summary || source.profile?.summary || '',
    },
    job_title_target: source.job_title_target || data?.job_title_extracted || '',
    
    experience: (source.experience || []).map(exp => {
      const { startDate, endDate, current } = parseDateRange(exp.date_range);
      let description = '';
      if (Array.isArray(exp.enhanced_description)) {
        description = exp.enhanced_description.join('\n• ');
        if (description) description = '• ' + description; 
      } else {
        description = exp.enhanced_description || exp.description || '';
      }

      return {
        jobTitle: exp.position, 
        company: exp.company,
        startDate: startDate,
        endDate: endDate,
        current: current,
        location: exp.location,
        description: description,
      };
    }),

    education: (source.education || []).map(edu => {
      const { startDate, endDate } = parseDateRange(edu.date_range);
      return {
        degree: edu.degree,
        institution: edu.institution,
        startDate: startDate,
        endDate: endDate,
      };
    }),

    skills: {
      technical: source.selected_skills || source.skills?.technical || [],
      soft: source.soft_skills || []
    },

    languages: source.selected_languages || source.languages || []
  };

  // B. RENDERIZADO: Pasamos t (traducciones) y lang (idioma para las fechas) a los Layouts
  return (
    <Document>
      {template === 'modern' && <ModernLayout data={mappedData} t={t} lang={language} />}
      {template === 'classic' && <ClassicLayout data={mappedData} t={t} lang={language} />}
      {template === 'creative' && <CreativeLayout data={mappedData} t={t} lang={language} />}
    </Document>
  );
};

export default CVDocument;