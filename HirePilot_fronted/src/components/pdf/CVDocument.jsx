import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';

// ==========================================
// 1. REGISTRO DE FUENTES
// ==========================================

// Importamos las fuentes (Asegúrate de que las rutas sean correctas en tu proyecto)
import RobotoRegular from '../../assets/fonts/Roboto/roboto-v50-latin-regular.ttf';
import RobotoItalic from '../../assets/fonts/Roboto/roboto-v50-latin-italic.ttf';
import RobotoMedium from '../../assets/fonts/Roboto/roboto-v50-latin-500.ttf';
import RobotoBold from '../../assets/fonts/Roboto/roboto-v50-latin-700.ttf';

import MerriweatherRegular from '../../assets/fonts/Merriweather/merriweather-v33-latin-regular.ttf';
import MerriweatherItalic from '../../assets/fonts/Merriweather/merriweather-v33-latin-italic.ttf';
import MerriweatherBold from '../../assets/fonts/Merriweather/merriweather-v33-latin-700.ttf';

import LatoRegular from '../../assets/fonts/Lato/lato-v25-latin-regular.ttf';
import LatoBold from '../../assets/fonts/Lato/lato-v25-latin-700.ttf';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 400 },
    { src: RobotoItalic, fontWeight: 400, fontStyle: 'italic' },
    { src: RobotoMedium, fontWeight: 500 },
    { src: RobotoBold, fontWeight: 700 },
  ],
});

Font.register({
  family: 'Merriweather',
  fonts: [
    { src: MerriweatherRegular, fontWeight: 400 },
    { src: MerriweatherItalic, fontWeight: 400, fontStyle: 'italic' },
    { src: MerriweatherBold, fontWeight: 700 },
  ],
});

Font.register({
  family: 'Lato',
  fonts: [
    { src: LatoRegular, fontWeight: 400 },
    { src: LatoBold, fontWeight: 700 },
  ],
});

// ==========================================
// 2. UTILIDADES Y HELPERS
// ==========================================

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Manejo de error si la fecha es inválida
  if (isNaN(date.getTime())) return dateString; 
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
};

// Helper para parsear rangos de fecha del Backend "YYYY-MM-DD - Present"
const parseDateRange = (dateRangeString) => {
  if (!dateRangeString) return { startDate: null, endDate: null, current: false };
  
  const parts = dateRangeString.split(' - ');
  const startDate = parts[0] ? parts[0].trim() : null;
  const endDateRaw = parts[1] ? parts[1].trim() : null;
  
  const isCurrent = endDateRaw?.toLowerCase().includes('present') || 
                    endDateRaw?.toLowerCase().includes('actualidad');

  return {
    startDate,
    endDate: isCurrent ? null : endDateRaw,
    current: isCurrent
  };
};

// ==========================================
// 3. LAYOUTS (Tus diseños originales)
// ==========================================

// --- TEMPLATE 1: MODERNO ---
const ModernLayout = ({ data }) => {
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
          <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Contacto</Text>
          <Text style={styles.textSidebar}>{data.profile.email}</Text>
          <Text style={styles.textSidebar}>{data.profile.phone}</Text>
          <Text style={styles.textSidebar}>{data.profile.location}</Text>
          {data.profile.linkedin && <Link src={data.profile.linkedin} style={styles.textSidebar}>LinkedIn</Link>}
        </View>

        <Text style={styles.sectionTitleSidebar}>Habilidades</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {data.skills?.technical?.map((skill, i) => (
                <Text key={i} style={{...styles.textSidebar, backgroundColor: '#374151', padding: '3 6', borderRadius: 4, fontSize: 9}}>{skill}</Text>
            ))}
        </View>

        <Text style={styles.sectionTitleSidebar}>Idiomas</Text>
        {data.languages?.map((lang, i) => (
          <Text key={i} style={styles.textSidebar}>• {lang.name} ({lang.level})</Text>
        ))}
      </View>

      <View style={styles.main}>
        <View style={{ marginBottom: 20 }}>
            <Text style={styles.name}>{data.profile.firstName} {data.profile.lastName}</Text>
            <Text style={styles.role}>{data.job_title_target || data.profile.profession}</Text>
            <Text style={styles.textMain}>{data.profile.summary}</Text>
        </View>

        <Text style={styles.sectionTitleMain}>Experiencia Laboral</Text>
        {data.experience?.map((exp, i) => (
          <View key={i} style={{ marginBottom: 15 }} wrap={false}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
              <Text style={styles.date}>{formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</Text>
            </View>
            <Text style={styles.company}>{exp.company}</Text>
            <Text style={{...styles.textMain, marginTop: 5}}>{exp.description}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitleMain}>Educación</Text>
        {data.education?.map((edu, i) => (
           <View key={i} style={{ marginBottom: 8 }} wrap={false}>
             <Text style={{ fontWeight: 700, fontSize: 11 }}>{edu.degree}</Text>
             <Text style={styles.textMain}>{edu.institution} | {formatDate(edu.startDate)}</Text>
           </View>
        ))}
      </View>
    </Page>
  );
};

// --- TEMPLATE 2: CLÁSICO ---
const ClassicLayout = ({ data }) => {
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

      <Text style={styles.sectionTitle}>Perfil Profesional</Text>
      <Text style={{ marginBottom: 10, textAlign: 'justify' }}>{data.profile.summary}</Text>

      <Text style={styles.sectionTitle}>Experiencia</Text>
      {data.experience?.map((exp, i) => (
        <View key={i} style={styles.jobBlock} wrap={false}>
          <View style={styles.jobRow}>
            <View>
                <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={styles.company}>{exp.company}</Text>
            </View>
            <Text style={styles.date}>{formatDate(exp.startDate)} — {exp.current ? 'Actualidad' : formatDate(exp.endDate)}</Text>
          </View>
          <Text style={{ fontSize: 10, textAlign: 'justify' }}>{exp.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Educación</Text>
      {data.education?.map((edu, i) => (
          <View key={i} style={styles.jobRow} wrap={false}>
              <Text style={{ fontWeight: 700 }}>{edu.degree}, {edu.institution}</Text>
              <Text style={styles.date}>{formatDate(edu.startDate)}</Text>
          </View>
      ))}
      
      <Text style={styles.sectionTitle}>Competencias</Text>
      <Text style={{ fontSize: 10 }}>{data.skills?.technical?.join(' • ')}</Text>
    </Page>
  );
};

// --- TEMPLATE 3: CREATIVO ---
const CreativeLayout = ({ data }) => {
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
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={{...styles.text, marginBottom: 20}}>{data.profile.summary}</Text>
  
            <Text style={styles.sectionTitle}>Experiencia</Text>
            {data.experience?.map((exp, i) => (
              <View key={i} style={{ marginBottom: 20 }} wrap={false}>
                <Text style={styles.itemTitle}>{exp.jobTitle}</Text>
                <Text style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{exp.company} | {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</Text>
                <Text style={styles.text}>{exp.description}</Text>
              </View>
            ))}
          </View>
  
          <View style={styles.rightCol}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                {data.skills?.technical?.map((skill, i) => (
                    <Text key={i} style={styles.tag}>{skill}</Text>
                ))}
            </View>
  
            <Text style={styles.sectionTitle}>Educación</Text>
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
// 4. COMPONENTE PRINCIPAL (ADAPTER + RENDER)
// ==========================================

export const CVDocument = ({ data, template = 'modern' }) => {
  
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
      // El backend devuelve el summary fuera del profile, el layout lo espera dentro.
      summary: source.profile_summary || source.profile?.summary || '',
    },
    job_title_target: source.job_title_target || data?.job_title_extracted || '',
    
    // Mapeo de Experiencia
    experience: (source.experience || []).map(exp => {
      const { startDate, endDate, current } = parseDateRange(exp.date_range);
      
      // Manejar enhanced_description si es array (lo unimos) o string
      let description = '';
      if (Array.isArray(exp.enhanced_description)) {
        description = exp.enhanced_description.join('\n• ');
        if (description) description = '• ' + description; // Añadimos viñeta al inicio
      } else {
        description = exp.enhanced_description || exp.description || '';
      }

      return {
        jobTitle: exp.position, // Mapping clave: position -> jobTitle
        company: exp.company,
        startDate: startDate,
        endDate: endDate,
        current: current,
        location: exp.location,
        description: description,
      };
    }),

    // Mapeo de Educación
    education: (source.education || []).map(edu => {
      const { startDate, endDate } = parseDateRange(edu.date_range);
      return {
        degree: edu.degree,
        institution: edu.institution,
        startDate: startDate,
        endDate: endDate,
      };
    }),

    // Mapeo de Skills
    skills: {
      technical: source.selected_skills || source.skills?.technical || [],
      soft: source.soft_skills || []
    },

    // Mapeo de Idiomas
    languages: source.selected_languages || source.languages || []
  };

  // B. RENDERIZADO: Seleccionamos el layout y pasamos los datos mapeados
  return (
    <Document>
      {template === 'modern' && <ModernLayout data={mappedData} />}
      {template === 'classic' && <ClassicLayout data={mappedData} />}
      {template === 'creative' && <CreativeLayout data={mappedData} />}
    </Document>
  );
};

export default CVDocument;