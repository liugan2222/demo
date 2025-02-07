import axios from 'axios'

import { Vendorform } from '@/components/tanstack/schema/formSchema/vendorformSchema'
import { Itemform } from '@/components/tanstack/schema/formSchema/itemformSchema'
import { Warehouseform } from '@/components/tanstack/schema/formSchema/warehouseformSchema'
import { Locationform } from '@/components/tanstack/schema/formSchema/locationformSchema'
import { Poform } from '@/components/tanstack/schema/formSchema/poformSchema'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    // 'X-TenantID': 'X',
  },
})

// Add an interceptor to include the auth token in requests
api.interceptors.request.use((config) => {
  const token = document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*=\s*([^;]*).*$)|^.*$/, "$1")
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// Define the login response type
interface LoginResponse {
  success: boolean
  token: string
}

// Auth endpoints
export async function login({ email, password }: { email: string; password: string }): Promise<LoginResponse> {
  // TODO: Implement actual login API call
  // const response = await api.post('/proxy/auth/login', { email, password })
  // return response.data
  if (email && password) console.log('logining')

  // Simulated response for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, token: "mock-token" })
    }, 1000)
  })
}

// Cached data
export async function getCountries() {
  const response = await api.get("/proxy/BffGeo/Countries")
  return response.data
}

export async function getStatesAndProvinces(countryId: string) {
  const response = await api.get("/proxy/BffGeo/StatesAndProvinces", {params: {countryId}})
  return response.data
}

export async function getUoms(uomTypeId: string) {
  const response = await api.get("/proxy/BffLists/UnitsOfMeasure", {params: {uomTypeId}})
  return response.data
}

// get warehouseList
// TODO ownerPartyId 获取
export async function getWarehouseList(ownerPartyId: string = 'FRESH_MART_DC') {
  const response = await api.get("/proxy/BffLists/Facilities", {params: {ownerPartyId}})
  return response.data
}

// get vendorList
export async function getVendorList() {
  const response = await api.get("/proxy/BffLists/Suppliers")
  return response.data
}

// get itemList
export async function getItemList() {
  const response = await api.get("/proxy/BffLists/RawItems")
  return response.data
}


/*  Vendor  */
export async function getVendors(size: number = 9999) {
  const response = await api.get<{
    content: any[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
  }>('/proxy/BffSuppliers', { params: { size } });

    // const transformedVendors = response.data.content.map((item) => {
    //   const transformedVendor: Vendor = {
    //     ...item, 
    //     id: item.supplierId, 
    //     name: item.supplierName,
    //   };
    //   return transformedVendor;
    // });
    
    const transformedVendors = response.data.content.map((item: any) => ({
      vendor: item.supplierShortName, 
      tel: item.telephone, 
      gcp: item.gs1CompanyPrefix, 
      vendorNumber: item.internalId,
      status: item.active=='Y'?'Active':'Inactive',
      ...item,
    }));
    return transformedVendors;
}

export async function addVendor(vendor: any) {
  const response = await api.post<Vendorform>('/proxy/BffSuppliers/batchAddSuppliers', vendor.items)
  return response.data
}

export async function getVendorById(id: string) {
  const response =  await api.get(`/proxy/BffSuppliers/${id}`)
  return response.data;
}

export async function updateVendor(id: string, vendor: Partial<Vendorform>) {
  const response = await api.put<Vendorform>(`/proxy/BffSuppliers/${id}`, vendor)
  return response.data
}


/*  Item  */
export async function getItems(size: number = 9999) {
  const response = await api.get<{
    content: any[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
  }>('/proxy/BffRawItems', { params: { size } });

    const transformedItems = response.data.content.map((item: any) => ({
      item: item.productName, 
      vendor: item.supplierName, 
      itemNumber: item.internalId, 
      status: item.active=='Y'?'Active':'Inactive',
      ...item,
    }));
    return transformedItems;
}

export async function addItem(item: any) {
  const response = await api.post<Itemform>('/proxy/BffRawItems/batchAddRawItems', item.items)
  return response.data
}

export async function getItemById(id: string) {
  const response =  await api.get(`/proxy/BffRawItems/${id}`)
  return response.data;
}

export async function updateItem(id: string, item: Partial<Itemform>) {
  const response = await api.put<Itemform>(`/proxy/BffRawItems/${id}`, item)
  return response.data
}


/*  Warehouse  */
// TODO login时 通过 指定接口获取 ownerPartyId   /BffTenants/current 的 partyId
export async function getWarehouses(size: number = 9999, ownerPartyId: string ='FRESH_MART_DC') {
  const response = await api.get<{
    content: any[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
  }>('/proxy/BffFacilities', { params: { size , ownerPartyId} });

    const transformedWarehouses = response.data.content.map((item: any) => {
      // Extract businessContacts if it exists
      const businessContacts = item.businessContacts || [];

      // Extract relevant fields from the first business contact if it exists
      const firstContact = businessContacts[0] || {};
      const {
        physicalLocationAddress = '',
        city = '',
        state = '',
        country = '',
        zipCode = ''
      } = firstContact;

      // Concatenate address fields, ignoring empty values
      const addressParts = [
        physicalLocationAddress,
        city,
        state,
        country,
        zipCode
      ].filter(Boolean); // Filter out empty strings

      const address = addressParts.join(', '); // Join with commas


      return {
        warehouse: item.facilityName,
        address: address, // Use the concatenated address
        warehouseNumber: item.internalId,
        status: item.active === 'Y' ? 'Active' : 'Inactive',
        ...item
      };
    });
    return transformedWarehouses;
}

export async function addWarehouse(warehouse: any) {
  const response = await api.post<Warehouseform>('/proxy/BffFacilities/batchAddFacilities', warehouse.items)
  return response.data
}

export async function getWarehouseById(id: string) {
  const response =  await api.get(`/proxy/BffFacilities/${id}`)
  return response.data;
}

export async function updateWarehouse(id: string, warehouse: Partial<Warehouseform>) {
  const response = await api.put<Warehouseform>(`/proxy/BffFacilities/${id}`, warehouse)
  return response.data
}

/*  Location  */
export async function getLocations() {
  const response =  await api.get(`/proxy/BffLists/Locations`)
  const transformedItems = response.data.map((item: any) => ({
    location: item.locationName,
    locationNumber: item.locationCode,
    warehouse: item.facilityName,
    status: item.active=='Y'?'Active':'Inactive',
    ...item,
  }));

  return transformedItems;
}

export async function addLocation(item: any) {
  const response = await api.post<Locationform>(`/proxy/BffFacilities/${item.items[0].facilityId}/Locations/batchAddFacilityLocations`, item.items)
  return response.data
}

export async function getLocationById(facilityId: string, locationSeqId: string) {
  const response =  await api.get(`/proxy/BffFacilities/${facilityId}/Locations/${locationSeqId}`)
  return response.data;
}

export async function updateLocation(facilityId: string, locationSeqId: string, item: Partial<Locationform>) {
  const response = await api.put<Locationform>(`/proxy/BffFacilities/${facilityId}/Locations/${locationSeqId}`, item)
  return response.data
}

/*  PO  */
export async function getPos(size: number = 9999) {
  const response = await api.get<{
    content: any[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
  }>('/proxy/BffPurchaseOrders', { params: { size } });

    const transformedItems = response.data.content.map((item: any) => ({
      poNumber: item.orderId, 
      vendor: item.supplierName, 
      orderStatus: item.statusId,
      ...item,
    }));
    return transformedItems;
}

export async function addPo(item: any) {
  const response = await api.post<Poform>(`/proxy/BffPurchaseOrders`, item)
  return response.data
}

export async function getPoById(id: string) {
  const response =  await api.get(`/proxy/BffPurchaseOrders/${id}`)
  return response.data;
}

export async function updatePo(id: string, item: Partial<Poform>) {
  const response = await api.put<Poform>(`/proxy/BffPurchaseOrders/${id}`, item)
  return response.data
}