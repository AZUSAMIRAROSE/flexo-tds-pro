import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer'
import { TDSRecordWithRelations } from '@/types/tds.types'
import { formatDate } from './utils'

// Register fonts (optional, for better quality)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// })

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 15,
    borderBottom: '2pt solid #1F4E79',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F4E79',
    textAlign: 'center',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  machineInfo: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
  sectionHeader: {
    backgroundColor: '#1F4E79',
    color: 'white',
    padding: 6,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '25%',
    marginBottom: 8,
    paddingRight: 10,
  },
  gridItem50: {
    width: '50%',
    marginBottom: 8,
    paddingRight: 10,
  },
  gridItem33: {
    width: '33.33%',
    marginBottom: 8,
    paddingRight: 10,
  },
  label: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  batchCode: {
    backgroundColor: '#FEF3C7',
    padding: 3,
    fontFamily: 'Courier',
    fontSize: 9,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 5,
    fontSize: 8,
    fontWeight: 'bold',
    borderBottom: '1pt solid #CBD5E1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    fontSize: 8,
    borderBottom: '0.5pt solid #E5E7EB',
  },
  tableCell: {
    width: '11%',
    paddingRight: 3,
  },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  qualityItem: {
    width: '14.28%',
    marginBottom: 6,
  },
  statusBadge: {
    padding: '3 8',
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  statusDraft: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusApproved: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#E5E7EB',
    opacity: 0.1,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1pt solid #CBD5E1',
    fontSize: 8,
    color: '#666',
  },
})

interface TDSPDFDocumentProps {
  data: TDSRecordWithRelations
}

const TDSPDFDocument: React.FC<TDSPDFDocumentProps> = ({ data }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Watermark */}
      {data.status !== 'Draft' && (
        <Text style={styles.watermark}>{data.status?.toUpperCase()}</Text>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.customerName}>
          {data.customer?.name}
          {data.customer?.location && `, ${data.customer.location}`}
        </Text>
        <Text style={styles.title}>FLEXO NARROW WEB · TECHNICAL DATA SHEET</Text>
        <Text style={styles.machineInfo}>
          Machine: {data.machine?.machine_code} | {data.machine?.machine_name}
        </Text>
      </View>

      {/* Job Information */}
      <Text style={styles.sectionHeader}>▶ JOB INFORMATION</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(data.date)}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Order Number</Text>
          <Text style={styles.value}>{data.order_number}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>No. of Units</Text>
          <Text style={styles.value}>{data.num_units}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Job Type</Text>
          <Text style={styles.value}>{data.job_type || '—'}</Text>
        </View>
        <View style={styles.gridItem50}>
          <Text style={styles.label}>Job / Product Name</Text>
          <Text style={styles.value}>{data.job_product_name || '—'}</Text>
        </View>
        <View style={styles.gridItem50}>
          <Text style={styles.label}>Design / Artwork / Bromide</Text>
          <Text style={styles.value}>{data.design_artwork_bromide || '—'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Operator</Text>
          <Text style={styles.value}>{data.operator_name || '—'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Speed (m/min)</Text>
          <Text style={styles.value}>{data.speed_mpm || '—'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Downtime (min)</Text>
          <Text style={styles.value}>{data.downtime_min || '—'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Shift No.</Text>
          <Text style={styles.value}>{data.shift_no || '—'}</Text>
        </View>
      </View>

      {/* Substrate Section */}
      <Text style={styles.sectionHeader}>▶ SUBSTRATE · CORONA · FOIL DETAILS</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem33}>
          <Text style={styles.label}>Substrate / Laminate</Text>
          <Text style={styles.value}>{data.substrate_laminate || '—'}</Text>
        </View>
        <View style={styles.gridItem33}>
          <Text style={styles.label}>Surface Type</Text>
          <Text style={styles.value}>{data.surface_type || '—'}</Text>
        </View>
        <View style={styles.gridItem33}>
          <Text style={styles.label}>Width (mm)</Text>
          <Text style={styles.value}>{data.width_mm || '—'}</Text>
        </View>
        {data.corona_treatment && (
          <>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Corona Wattage</Text>
              <Text style={styles.value}>{data.corona_wattage || '—'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Treatment Side</Text>
              <Text style={styles.value}>{data.corona_treatment_side || '—'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Dyne Level</Text>
              <Text style={styles.value}>{data.corona_dyne_level || '—'}</Text>
            </View>
          </>
        )}
      </View>

      {/* Unit Sequence Table */}
      <Text style={styles.sectionHeader}>▶ PRINTING UNIT SEQUENCE</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableCell, width: '8%' }}>Unit</Text>
          <Text style={{ ...styles.tableCell, width: '12%' }}>Color</Text>
          <Text style={{ ...styles.tableCell, width: '10%' }}>Anilox</Text>
          <Text style={{ ...styles.tableCell, width: '10%' }}>Volume</Text>
          <Text style={{ ...styles.tableCell, width: '15%' }}>Ink Name</Text>
          <Text style={{ ...styles.tableCell, width: '15%' }}>Batch Code</Text>
          <Text style={{ ...styles.tableCell, width: '10%' }}>Lamp Hrs</Text>
          <Text style={{ ...styles.tableCell, width: '10%' }}>Intensity</Text>
          <Text style={{ ...styles.tableCell, width: '10%' }}>Tape</Text>
        </View>
        {data.units?.map((unit) => (
          <View key={unit.id} style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, width: '8%' }}>{unit.unit_no}</Text>
            <Text style={{ ...styles.tableCell, width: '12%' }}>{unit.color_station || '—'}</Text>
            <Text style={{ ...styles.tableCell, width: '10%' }}>
              {unit.anilox_value} {unit.anilox_unit}
            </Text>
            <Text style={{ ...styles.tableCell, width: '10%' }}>
              {unit.volume_value} {unit.volume_unit}
            </Text>
            <Text style={{ ...styles.tableCell, width: '15%' }}>{unit.ink_name || '—'}</Text>
            <Text style={{ ...styles.batchCode, ...styles.tableCell, width: '15%' }}>
              {unit.batch_code || '—'}
            </Text>
            <Text style={{ ...styles.tableCell, width: '10%' }}>{unit.lamp_hrs || '—'}</Text>
            <Text style={{ ...styles.tableCell, width: '10%' }}>{unit.intensity_pct || '—'}%</Text>
            <Text style={{ ...styles.tableCell, width: '10%' }}>{unit.plate_tape || '—'}</Text>
          </View>
        ))}
      </View>

      {/* Quality Parameters */}
      <Text style={styles.sectionHeader}>▶ QUALITY PARAMETERS</Text>
      <View style={styles.qualityGrid}>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Tape Test</Text>
          <Text style={styles.value}>{data.tape_test || 'N/A'}</Text>
        </View>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Flow Marks</Text>
          <Text style={styles.value}>{data.flow_marks || 'N/A'}</Text>
        </View>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Flex Test</Text>
          <Text style={styles.value}>{data.flex_test || 'N/A'}</Text>
        </View>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Graphite Test</Text>
          <Text style={styles.value}>{data.graphite_test || 'N/A'}</Text>
        </View>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Adhesion Test</Text>
          <Text style={styles.value}>{data.adhesion_test || 'N/A'}</Text>
        </View>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Rub/Scuff</Text>
          <Text style={styles.value}>{data.rub_scuff_test || 'N/A'}</Text>
        </View>
        <View style={styles.qualityItem}>
          <Text style={styles.label}>Ink Lay/Tone</Text>
          <Text style={styles.value}>{data.ink_lay_tone_check || 'N/A'}</Text>
        </View>
      </View>
      
      <View style={styles.grid}>
        <View style={styles.gridItem50}>
          <Text style={styles.label}>Overall Result</Text>
          <View
            style={[
              styles.statusBadge,
              data.overall_result === 'Pass' && styles.statusCompleted,
              data.overall_result === 'Fail' && { backgroundColor: '#FEE2E2', color: '#991B1B' },
              data.overall_result === 'Conditional' && { backgroundColor: '#FEF3C7', color: '#92400E' },
            ]}
          >
            <Text>{data.overall_result || 'Conditional'}</Text>
          </View>
        </View>
        <View style={styles.gridItem50}>
          <Text style={styles.label}>Quality Notes</Text>
          <Text style={styles.value}>{data.quality_notes || '—'}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Prepared By: {data.prepared_by}</Text>
        <Text>{formatDate(data.prepared_at)}</Text>
        <Text style={{ marginTop: 5 }}>
          Status: {data.status}
          {data.status === 'Approved' && data.approved_at && ` | Approved: ${formatDate(data.approved_at)}`}
        </Text>
      </View>
    </Page>
  </Document>
)

export async function generatePDF(data: TDSRecordWithRelations): Promise<Blob> {
  const doc = <TDSPDFDocument data={data} />
  return await pdf(doc).toBlob()
}

export function downloadPDF(blob: Blob, filename: string) {
  saveAs(blob, filename)
}