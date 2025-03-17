"use client"

import axios from 'axios'
// import { useRouter } from "next/router"

import { Vendorform } from '@/components/tanstack/schema/formSchema/vendorformSchema'
import { Itemform } from '@/components/tanstack/schema/formSchema/itemformSchema'
import { Warehouseform } from '@/components/tanstack/schema/formSchema/warehouseformSchema'
import { Locationform } from '@/components/tanstack/schema/formSchema/locationformSchema'
import { Poform } from '@/components/tanstack/schema/formSchema/poformSchema'
import { Receiveform } from '@/components/tanstack/schema/formSchema/receiveformSchema'
import { Userform } from '@/components/tanstack/schema/formSchema/userformSchema'
import { Roleform } from '@/components/tanstack/schema/formSchema/roleformSchema'


// 全局配置 axios 携带 Cookie
// axios.defaults.withCredentials = true;


const authApi = axios.create({
  baseURL: '/api/auth', // 通过代理转发
  withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/x-www-form-urlencoded'
  // }
})

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

// Add a response interceptor
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      document.cookie = `x-csrf-token=; Path=/;`
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userPermissions')
      localStorage.removeItem('userInfo')

      redirectToLogin()
    }
    return Promise.reject(error)
  },
)

export async function get_csrf(): Promise<string> {
  // const response = await axios.get('http://47.88.28.103:9000/login', {
  const response = await authApi.get('/api/login', {
    responseType: 'text' // 确保以文本形式接收 HTML
  });
  
  // 使用 DOMParser 解析 HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'text/html');
  
  // 查找 CSRF 输入框
  const csrfInput = doc.querySelector('input[name="_csrf"]');
  if (!csrfInput) {
    throw new Error('CSRF token input field not found');
  }

  // const cookies = response.headers['set-cookie']?.join('; ') || '';
  
  // 获取 value 属性
  const csrfToken = csrfInput.getAttribute('value');
  if (!csrfToken) {
    throw new Error('CSRF token value is empty');
  }
  
  return csrfToken
}

export async function login(
  { email, password }: { email: string; password: string },
  csrfToken: string // 传入从 get_csrf 获取的 token
): Promise<string> {

  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)
  formData.append('_csrf', csrfToken)

  // const response = await axios.post('http://47.88.28.103:9000/login', 
  await authApi.post('/api/login',   
  formData
  // ,
  //   {
  //     // headers: {
  //     //   'X-CSRF-Token': csrfToken // 将 CSRF 放在请求头
  //     // },
  //     responseType: 'text'
  //   }
  );
 
  document.cookie = `x-csrf-token=${encodeURIComponent(csrfToken)}; Path=/;`
  
  return 'succcess';
}


/*  admin  */
/*  user  */
export async function getUsers() {
  // const params = {} as Record<string, any>;
  // if (param1 !== undefined) {
  //   params.supplierId = param1;
  // }
  const response = await authApi.get('/api/auth-srv/users');
  const content = response.data || [];
  
  // 转换
  const transformedItems = (content as any[]).map((item: any) => ({
    id: item.username,
    userNumber:item.employeeNumber,
    roles: item.groups?.map((group: any) => group.groupName).join(', ') || '', // 拼接 groupName
    status:  item.enabled==true?'Active':'Disabled',
    ...item,
    email: item.username,
  }));
  return transformedItems;
}

/* 调用post 接口前要重新获取令牌 */
export async function refresh_csrf(
  url: string // 传入从 get_csrf 获取的 token
): Promise<string> {

  // const response = await axios.post('http://47.88.28.103:9000/login', 
  const response = await authApi.get( url,   
  // formData,
    {
      // headers: {
      //   'X-CSRF-Token': csrfToken // 将 CSRF 放在请求头
      // },
      responseType: 'text'
    }
  );
  
  // 使用 DOMParser 解析 HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data, 'text/html');
  
  // 查找 CSRF 输入框
  const csrfInput = doc.querySelector('input[name="_csrf"]');
  if (!csrfInput) {
    throw new Error('CSRF token input field not found');
  }
  
  // 获取 value 属性
  const X_CSRF_Token = csrfInput.getAttribute('value');
  if (!X_CSRF_Token) {
    throw new Error('CSRF token value is empty');
  }

  // 登录成功后设置 Cookie
  // document.cookie = `x-csrf-token=${encodeURIComponent(X_CSRF_Token)}`;
  document.cookie = `x-csrf-token=${encodeURIComponent(X_CSRF_Token)}; Path=/;`
  localStorage.setItem('X_CSRF_Token', JSON.stringify(X_CSRF_Token));
  
  return X_CSRF_Token;
}

export async function addUser(item: any) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.post<Userform>(`/api/users/pre-register`, item
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )

  return response.data
}

export async function getUserById(id: string, includesProductDetails?: boolean, includesItemFulfillments?: boolean) {
  const params = {} as Record<string, any>;
  if (includesProductDetails !== undefined) {
    params.includesProductDetails = includesProductDetails;
  }
  if (includesItemFulfillments !== undefined) {
    params.includesItemFulfillments = includesItemFulfillments;
  }
  const response = await authApi.get(`/api/users/${id}`, { params });
  return response.data;
}

export async function updateUser(id: string, item: Partial<Userform>) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.put<Userform>(`/api/auth-srv/users/${id}`, item
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

export async function userEnabled(id: string, X_CSRF_Token: string) {
  const response = await authApi.post(`/api/users/${id}/toggle-enabled`,{}
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

// 用户修改密码
export async function updatePassword(username: string) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.put<Userform>(`/api/users/${username}/regenerate-password`, {}
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

// 刷新用户一次性密码
export async function regeneratePassword(username: string) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.put<Userform>(`/api/users/${username}/regenerate-password`, {}
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

/*  role  */
export async function getRoles(enabled?: boolean) {
  const params = {} as Record<string, any>;
  // enabled = enabled ?? false; 
  if (enabled !== undefined) {
    params.enabled = enabled;
  }
  const response = await authApi.get(`/api/groups`, { params });
  const content = response.data || [];
  // 转换
  const transformedItems = (content as any[]).map((item: any) => ({
    role: item.groupName, 
    status:  item.enabled==true?'Active':'Disabled',
    ...item,
    // permissions: item.permissions?.map((permission: string) => permission).join(', ') || '', 
    permissions: (item.permissions?.filter((permission: string) => permission.includes('_')) || []).join(', ') || '',
    permissionList: item.permissions,
    id: item.id.toString()
  }));
  return transformedItems;
}

export async function addRole(item: any) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.post<Roleform>(`/api/auth-srv/groups`, item
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

export async function getRoleById(id: string
  // , includesProductDetails?: boolean, includesItemFulfillments?: boolean
  ) {
  const params = {} as Record<string, any>;
  // if (includesProductDetails !== undefined) {
  //   params.includesProductDetails = includesProductDetails;
  // }
  // if (includesItemFulfillments !== undefined) {
  //   params.includesItemFulfillments = includesItemFulfillments;
  // }
  const response = await authApi.get(`/api/auth-srv/groups/${id}`, { params });
  return response.data;
}

export async function updateRole(id: string, item: Partial<Roleform>) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.put<Roleform>(`/api/auth-srv/groups/${id}`, item
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

export async function userToRole(id: string, userNameList: Partial<string[]>) {
  const X_CSRF_Token = JSON.parse(localStorage.getItem('X_CSRF_Token') || '');
  const response = await authApi.put<Roleform>(`/api/auth-srv/groups/${id}/users`, userNameList
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

export async function getRoleUsers(id: string) {
  const response = await authApi.get<Roleform>(`/api/auth-srv/groups/${id}/users`)
  return response.data
}

export async function roleEnabled(id: string, X_CSRF_Token: string) {
  const response = await authApi.post(`/api/groups/${id}/toggle-enabled`,{}
  ,{
    headers: {
      'x-csrf-token': X_CSRF_Token
    }
   }
  )
  return response.data
}

// Define the login response type
// interface LoginResponse {
//   success: boolean
//   token: string
// }
// Auth endpoints
// export async function login({ email, password }: { email: string; password: string }): Promise<LoginResponse> {
//   // TODO: Implement actual login API call
//   // const response = await api.post('/proxy/auth/login', { email, password })
//   // return response.data
//   if (email && password) console.log('logining')

//   // Simulated response for now
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ success: true, token: "mock-token" })
//     }, 1000)
//   })
// }


// const token = document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*=\s*([^;]*).*$)|^.*$/, "$1")
const api = axios.create({
  baseURL: '/api',
  // withCredentials: true, // 必须显式设置
  headers: {
    // 'Content-Type': 'application/json',
    'X-TenantID': 'X',
    // 'Authorization': `Bearer ${token}`
  },
  // responseType: 'arraybuffer' // 强制响应为二进制数据
})

// TODO token 处理
// // Add an interceptor to include the auth token in requests
// api.interceptors.request.use((config) => {
//   const token = document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*=\s*([^;]*).*$)|^.*$/, "$1")
//   if (token) {
//     config.headers["Authorization"] = `Bearer ${token}`
//   }
//   // config.headers.Cookie = document.cookie
//   return config
// })


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
export async function getWarehouseList(ownerPartyId: string = 'FRESH_MART_DC', active: string = 'Y') {
  const response = await api.get("/proxy/BffLists/Facilities", {params: {ownerPartyId, active}})
  return response.data
}

// get vendorList
export async function getVendorList(active: string = 'Y') {
  const response = await api.get("/proxy/BffLists/Suppliers", {params: {active}})
  return response.data
}

// get itemList
export async function getItemList(supplierId?: string, active: string = 'Y') {
  const params = {} as Record<string, any>;
  if (supplierId !== undefined) {
    params.active = active;
    params.supplierId = supplierId;
  }
  const response =  await api.get(`/proxy/BffLists/RawItems`, { params });
  return response.data;
}

// get supplierType  SUPPLIER_TYPE_ENUM
export async function getSupplierType(enumTypeId: string) {
  const response = await api.get("/proxy/Enumerations", {params: {enumTypeId}})
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
    const content = response.data.content || [];
    const transformedVendors = (content as any[]).map((item: any) => ({
      id: item.supplierId,
      vendor: item.supplierShortName, 
      tel: item.telephone, 
      gcp: item.gs1CompanyPrefix, 
      vendorNumber: item.internalId,
      status: item.active=='Y'?'Activated':'Disabled',
      ...item,
    }));
    return transformedVendors;
}

export async function addVendor(vendor: any) {
  const response = await api.post<Vendorform>('/proxy/BffSuppliers/batchAddSuppliers', vendor.items)
  return response.data
}

export async function getVendorById(id: string, includesFacilities?: boolean) {
  const params = {} as Record<string, any>;
  if (includesFacilities !== undefined) {
    params.includesFacilities = includesFacilities;
  }
  const response =  await api.get(`/proxy/BffSuppliers/${id}`, { params });
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

    const content = response.data.content || [];
    const transformedItems = (content as any[]).map((item: any) => ({
      id: item.productId,
      item: item.productName, 
      vendor: item.supplierName, 
      itemNumber: item.internalId, 
      status: item.active=='Y'?'Activated':'Disabled',
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

    const content = response.data.content || [];
    const transformedWarehouses = (content as any[]).map((item: any) => {
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
        id: item.facilityId,
        warehouse: item.facilityName,
        address: address, // Use the concatenated address
        warehouseNumber: item.internalId,
        status: item.active === 'Y' ? 'Activated' : 'Disabled',
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
  const content = response.data || [];
  const transformedItems = (content as any[]).map((item: any) => ({
    id: item.locationSeqId,
    location: item.locationName,
    locationNumber: item.locationCode,
    warehouse: item.facilityName,
    status: item.active=='Y'?'Activated':'Disabled',
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
export async function getPos(supplierId?: string) {
  const params = {size: 9999} as Record<string, any>;
  if (supplierId !== undefined) {
    params.supplierId = supplierId;
  }
  const response = await api.get<{
    content: any[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
  }>('/proxy/BffPurchaseOrders', { params });
    const content = response.data.content || [];
    const transformedItems = (content as any[]).map((item: any) => ({
      id: item.orderId,
      poNumber: item.orderId, 
      vendor: item.supplierName, 
      orderStatus: item.fulfillmentStatusId?(item.fulfillmentStatusId):(item.statusId?item.statusId:'NOT_FULFILLED'),
      ...item,
    }));
    return transformedItems;
}

export async function addPo(item: any) {
  const response = await api.post<Poform>(`/proxy/BffPurchaseOrders`, item)
  return response.data
}

export async function getPoById(id: string, includesProductDetails?: boolean, includesItemFulfillments?: boolean) {
  const params = {} as Record<string, any>;
  if (includesProductDetails !== undefined) {
    params.includesProductDetails = includesProductDetails;
  }
  if (includesItemFulfillments !== undefined) {
    params.includesItemFulfillments = includesItemFulfillments;
  }
  const response = await api.get(`/proxy/BffPurchaseOrders/${id}`, { params });
  return response.data;
}

export async function updatePo(id: string, item: Partial<Poform>) {
  const response = await api.put<Poform>(`/proxy/BffPurchaseOrders/${id}`, item)
  return response.data
}

/* active deactive */

export async function vendorDeactive(item: string[]) {
  const response = await api.post<string[]>(`/proxy/BffSuppliers/batchDeactivateSuppliers`, item)
  return response.data
}

export async function vendorActive(item: string[]) {
  const response = await api.post<string[]>(`/proxy/BffSuppliers/batchActivateSuppliers`, item)
  return response.data
}

export async function itemDeactive(item: string[]) {
  const response = await api.put<string[]>(`/proxy/BffRawItems/batchDeactivateRawItems`, item)
  return response.data
}

export async function itemActive(item: string[]) {
  const response = await api.put<string[]>(`/proxy/BffRawItems/batchActivateRawItems`, item)
  return response.data
}

export async function warehouseDeactive(item: string[]) {
  const response = await api.put<string[]>(`/proxy/BffFacilities/batchDeactivateFacilities`, item)
  return response.data
}

export async function warehouseActive(item: string[]) {
  const response = await api.put<string[]>(`/proxy/BffFacilities/batchActivateFacilities`, item)
  return response.data
}

export async function locationDeactive(facilityId: string ,item: string[]) {
  const response = await api.put<string[]>(`/proxy/BffFacilities/${facilityId}/Locations/batchDeactivateLocations`, item)
  return response.data
}

export async function locationActive(facilityId: string ,item: string[]) {
  const response = await api.put<string[]>(`/proxy/BffFacilities/${facilityId}/Locations/batchActivateLocations`, item)
  return response.data
}

/*  Receive  */
export async function getReceives(size: number = 9999) {
  const response = await api.get<{
    content: any[];
    totalElements: number;
    size: number;
    number: number;
    totalPages: number;
  }>('/proxy/BffReceipts', { params: { size } });
    const content = response.data.content || [];
    const transformedItems = (content as any[]).map((item: any) => ({
      id: item.documentId,
      receivingNumber: item.documentId, 
      PO: item.primaryOrderId, 
      receivingDate: item.createdAt, 
      vendor: item.partyNameFrom, 
      status: item.statusId,
      ...item,
    }));
    return transformedItems;
}

export async function getReceiveById(id: string, derivesQaInspectionStatus?: boolean) {
  const params = {} as Record<string, any>;
  if (derivesQaInspectionStatus !== undefined) {
    params.derivesQaInspectionStatus = derivesQaInspectionStatus;
  }
  const response = await api.get(`/proxy/BffReceipts/${id}`, { params });
  return response.data;
}

export async function updateReceive(id: string, item: Partial<Receiveform>) {
  const response = await api.put<Poform>(`/proxy/BffReceipts/${id}`, item)
  return response.data
}


/* file */
export async function uploadFile(file: File) {
  // check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG/PNG/GIF/WEBP format is supported.');
  }

  //  totest
  // const response = await fetch('/test1.jpg');
  // const response = await fetch('/test222.txt');
  // const blob = await response.blob();

  const formData = new FormData()
  formData.append('file', file)
  formData.append('isPublic', 'true')

  // 使用与Android完全一致的参数结构
  // const blob = new Blob([file], { type: file.type });
  // formData.append('file', blob, 'test222.txt');
  // formData.append('file', blob, 'test1.jpg');
  // formData.append('file', blob, file.name);
  // formData.append('isPublic', 'true');

  // return api.post('/proxy/files/upload', formData

  // 直接调用后端地址（绕过代理）
  // 手动获取 token
  // const token = document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*=\s*([^;]*).*$)|^.*$/, "$1");

  // return axios.post('http://47.88.28.103:8080/api/files/upload', formData, {
  return axios.post('https://fp.ablueforce.com/api/files/upload', formData, {    
    headers: {
    //  'X-TenantID': 'X', // 必须与 Android 一致的 Header
      // ...(token && { 'Authorization': `Bearer ${token}` }), // 携带 Token
      // 不要设置 Content-Type，由浏览器自动生成 multipart/form-data
      "Authorization": "Basic dXNlcjpwYXNzd29yZA=="
    }, 
    transformRequest: (data) => data,
  });
}