const APP_TITLE = 'QuickShip Customer Profile';
const DEFAULT_SHEET_NAME = 'Customer Profiles';
const SHEET_ID_PROPERTY = 'QUICKSHIP_SHEET_ID';
const SHEET_NAME_PROPERTY = 'QUICKSHIP_SHEET_NAME';

const PROFILE_SCHEMA = [
  { key: 'submittedAt', label: 'Submitted At', system: true },
  { key: 'qsCode', label: 'QS Code', section: 'QuickShip Reference', required: true, type: 'text' },
  { key: 'companyName', label: 'Company Name', section: 'Profiling Section', required: true, type: 'text' },
  { key: 'ownerOrDirectorName', label: 'Owner or Director Name', section: 'Profiling Section', type: 'text' },
  { key: 'contactPerson', label: 'Contact Person', section: 'Profiling Section', type: 'text' },
  { key: 'designation', label: 'Designation', section: 'Profiling Section', type: 'text' },
  { key: 'contactNumber', label: 'Contact Number', section: 'Profiling Section', type: 'tel' },
  { key: 'decisionMaker', label: 'Descision Maker - Name , Designation & Contact no', section: 'Profiling Section', type: 'textarea' },
  { key: 'emailId', label: 'Email ID', section: 'Profiling Section', type: 'email' },
  { key: 'website', label: 'Website', section: 'Profiling Section', type: 'url' },
  { key: 'registeredOfficeAddress', label: 'Registered Office Address', section: 'Profiling Section', type: 'textarea' },
  { key: 'branchLocations', label: 'Branch Locations', section: 'Profiling Section', type: 'textarea' },
  { key: 'natureOfBusiness', label: 'Nature of Business', section: 'Business & Commercial Overview', type: 'text', remark: 'Manufacturer/Trader/E-com/Co-loader/Wholseller/FF etc' },
  { key: 'yearOfEstablishment', label: 'Year of Establishment', section: 'Business & Commercial Overview', type: 'number' },
  { key: 'obBrandCountryNames', label: 'OB Brand - Country names', section: 'Business & Commercial Overview', type: 'textarea' },
  { key: 'obSelfNetworkCountryNames', label: 'OB Self Netwrok - Country names', section: 'Business & Commercial Overview', type: 'textarea' },
  { key: 'importOriginCountry', label: 'Import - Origin Country', section: 'Business & Commercial Overview', type: 'textarea' },
  { key: 'monthlyLogisticSpend', label: 'Monthly Logistic Spend', section: 'Business & Commercial Overview', type: 'text' },
  { key: 'shipmentVolumeExport', label: 'Shipment Volume (per month) - Export', section: 'Business & Commercial Overview', type: 'text' },
  { key: 'revenueExport', label: 'Revenue (per month) - Export', section: 'Business & Commercial Overview', type: 'text' },
  { key: 'revenueImport', label: 'Revenue (per month) - Import', section: 'Business & Commercial Overview', type: 'text' },
  { key: 'shipmentFrequency', label: 'Shipment Frequency', section: 'Business & Commercial Overview', type: 'text' },
  { key: 'issuesWithCurrentPartner', label: 'Issues with current partner if any', section: 'Business & Commercial Overview', type: 'textarea' },
  { key: 'peakSeason', label: 'Peak Season', section: 'Business & Commercial Overview', type: 'text' },
  { key: 'shipmentType', label: 'Shipments Type - CSBIV, V or Cargo', section: 'Logistics & Operations', type: 'text' },
  { key: 'deliveryType', label: 'Delivery Type', section: 'Logistics & Operations', type: 'text' },
  { key: 'logisticPartners', label: 'Logistic Partners', section: 'Logistics & Operations', type: 'textarea' },
  { key: 'pickupFacility', label: 'Pickup Facility if any', section: 'Logistics & Operations', type: 'textarea' },
  { key: 'interestedInWarehousing', label: 'Interested in Warehousing', section: 'Value Added Opportunities', type: 'select', options: ['', 'Yes', 'No', 'Maybe'] },
  { key: 'interestedInPackagingSupport', label: 'Interested in Packaging Support', section: 'Value Added Opportunities', type: 'select', options: ['', 'Yes', 'No', 'Maybe'] },
  { key: 'interestedInCustomsClearanceConsultancy', label: 'Interested in Customs Clearance Consultancy', section: 'Value Added Opportunities', type: 'select', options: ['', 'Yes', 'No', 'Maybe'] },
  { key: 'interestedInInsurance', label: 'Interested in Insurance', section: 'Value Added Opportunities', type: 'select', options: ['', 'Yes', 'No', 'Maybe'] },
  { key: 'potentialForSeaFreightAirFreight', label: 'Potential for Sea Freight/ Air Freight', section: 'Value Added Opportunities', type: 'text' },
  { key: 'remarks', label: 'Remarks', section: 'Value Added Opportunities', type: 'textarea' }
];

function doGet() {
  return HtmlService.createTemplateFromFile('App')
    .evaluate()
    .setTitle(APP_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function setupQuickShipSheet() {
  const spreadsheet = SpreadsheetApp.create(APP_TITLE);
  PropertiesService.getScriptProperties().setProperties({
    [SHEET_ID_PROPERTY]: spreadsheet.getId(),
    [SHEET_NAME_PROPERTY]: DEFAULT_SHEET_NAME
  });
  ensureSheet_();
  return {
    ok: true,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    sheetName: DEFAULT_SHEET_NAME
  };
}

function setQuickShipSheet(spreadsheetId, sheetName) {
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is required.');
  }
  PropertiesService.getScriptProperties().setProperties({
    [SHEET_ID_PROPERTY]: String(spreadsheetId).trim(),
    [SHEET_NAME_PROPERTY]: String(sheetName || DEFAULT_SHEET_NAME).trim()
  });
  ensureSheet_();
  return {
    ok: true,
    spreadsheetId: String(spreadsheetId).trim(),
    sheetName: getSheetName_()
  };
}

function getSchema() {
  ensureSheet_();
  return {
    ok: true,
    title: APP_TITLE,
    sheetName: getSheetName_(),
    columns: PROFILE_SCHEMA
  };
}

function saveProfile(payload) {
  const sheet = ensureSheet_();
  const profile = sanitizeProfile_(payload || {});
  sheet.appendRow(profileToRow_(profile));
  return {
    ok: true,
    message: 'Profile saved to Google Sheet.',
    profile
  };
}

function lookupProfiles(query) {
  const sheet = ensureSheet_();
  const qsCode = normalize_(query && query.qsCode);
  const companyName = normalize_(query && query.companyName);
  if (!qsCode && !companyName) {
    throw new Error('Enter QS Code or Company Name.');
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, count: 0, profiles: [] };
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, PROFILE_SCHEMA.length).getValues();
  const profiles = rows
    .map(rowToProfile_)
    .filter(profile => {
      const profileQs = normalize_(profile.qsCode);
      const profileCompany = normalize_(profile.companyName);
      const qsMatches = qsCode ? profileQs === qsCode : true;
      const companyMatches = companyName ? profileCompany.indexOf(companyName) !== -1 : true;
      return qsMatches && companyMatches;
    })
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));

  return {
    ok: true,
    count: profiles.length,
    profiles
  };
}

function getHealth() {
  const properties = PropertiesService.getScriptProperties();
  return {
    ok: true,
    spreadsheetConfigured: Boolean(properties.getProperty(SHEET_ID_PROPERTY)),
    sheetName: getSheetName_()
  };
}

function ensureSheet_() {
  const spreadsheet = getSpreadsheet_();
  const sheetName = getSheetName_();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const headers = PROFILE_SCHEMA.map(column => column.label);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  const currentHeaders = headerRange.getValues()[0];
  const headerMatches = headers.every((header, index) => currentHeaders[index] === header);
  if (!headerMatches) {
    headerRange.setValues([headers]);
    headerRange
      .setFontWeight('bold')
      .setBackground('#123f68')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

function getSpreadsheet_() {
  const sheetId = PropertiesService.getScriptProperties().getProperty(SHEET_ID_PROPERTY);
  if (sheetId) {
    return SpreadsheetApp.openById(sheetId);
  }

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  throw new Error('No Google Sheet configured. Run setupQuickShipSheet() or set QUICKSHIP_SHEET_ID in Script Properties.');
}

function getSheetName_() {
  return PropertiesService.getScriptProperties().getProperty(SHEET_NAME_PROPERTY) || DEFAULT_SHEET_NAME;
}

function sanitizeProfile_(payload) {
  const profile = {};
  PROFILE_SCHEMA.forEach(column => {
    if (column.system) return;
    profile[column.key] = typeof payload[column.key] === 'string' ? payload[column.key].trim() : '';
  });

  if (!profile.qsCode) {
    throw new Error('QS Code is required.');
  }
  if (!profile.companyName) {
    throw new Error('Company Name is required.');
  }

  return profile;
}

function profileToRow_(profile) {
  return PROFILE_SCHEMA.map(column => {
    if (column.key === 'submittedAt') {
      return new Date();
    }
    return profile[column.key] || '';
  });
}

function rowToProfile_(row) {
  const profile = {};
  PROFILE_SCHEMA.forEach((column, index) => {
    const value = row[index];
    profile[column.key] = value instanceof Date ? value.toISOString() : String(value || '');
  });
  return profile;
}

function normalize_(value) {
  return String(value || '').trim().toLowerCase();
}
