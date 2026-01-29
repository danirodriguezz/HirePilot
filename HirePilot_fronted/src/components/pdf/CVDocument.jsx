import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Estilos básicos (puedes personalizarlos mucho más)
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase' },
  title: { fontSize: 14, color: '#666', marginTop: 5 },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#2c3e50', textTransform: 'uppercase' },
  text: { fontSize: 10, marginBottom: 3, lineHeight: 1.4, color: '#333' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  jobTitle: { fontSize: 11, fontWeight: 'bold' },
  jobCompany: { fontSize: 11, fontStyle: 'italic' },
  date: { fontSize: 9, color: '#666' },
  bulletPoint: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10 }
});

// Este componente recibe 'data' que es el JSON 'structured_cv_data' del backend
export const CVDocument = ({ data }) => {
  if (!data) return null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO: Datos personales extraídos del JSON o pasados como prop extra */}
        <View style={styles.header}>
           {/* Nota: Asegúrate de que tu JSON de IA devuelve el nombre, si no, pásalo desde userData */}
          <Text style={styles.name}>{data.personal_info?.full_name || "Nombre Candidato"}</Text>
          <Text style={styles.title}>{data.job_title_target || "Profesional TI"}</Text>
          <Text style={styles.text}>{data.personal_info?.email} | {data.personal_info?.phone}</Text>
          <Text style={styles.text}>{data.personal_info?.linkedin}</Text>
        </View>

        {/* RESUMEN PERFIL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil Profesional</Text>
          <Text style={styles.text}>{data.profile_summary}</Text>
        </View>

        {/* HABILIDADES (Skills) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades Técnicas</Text>
          <Text style={styles.text}>
            {data.selected_skills?.join(" • ")}
          </Text>
        </View>

        {/* EXPERIENCIA LABORAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia Profesional</Text>
          {data.experience?.map((exp, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{exp.position}</Text>
                <Text style={styles.date}>{exp.date_range}</Text>
              </View>
              <Text style={styles.jobCompany}>{exp.company} - {exp.location}</Text>
              
              {/* Renderizar Bullet Points mejorados por IA */}
              {exp.enhanced_description?.map((point, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* PROYECTOS */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyectos Destacados</Text>
            {data.projects.map((proj, index) => (
              <View key={index} style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{proj.title} - {proj.role}</Text>
                <Text style={styles.text}>{proj.description}</Text>
                <Text style={{ fontSize: 9, color: '#555' }}>Stack: {proj.tech_stack?.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
};