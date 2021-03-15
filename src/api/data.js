import axios from "@/libs/api.request"

export const getProductList = params => {
  return axios.request({
    url: "ztx/product/",
    method: "get",
    params: params
  })
}

export const createProduct = params => {
  return axios.request({
    url: "ztx/product/",
    method: "post",
    data: params
  })
}

export const editProduct = params => {
  return axios.request({
    url: "ztx/product/"+ params.id+'/',
    method: "put",
    data: params
  })
}

export const getCostomerList = params => {
  return axios.request({
    url: "ztx/costomer/",
    method: "get",
    params: params
  })
}

export const createCostomer = params => {
  return axios.request({
    url: "ztx/costomer/",
    method: "post",
    data: params
  })
}

export const editCostomer = params => {
  return axios.request({
    url: "ztx/costomer/"+ params.id+'/',
    method: "put",
    data: params
  })
}

export const rechargeCostomer = params => {
  return axios.request({
    url: "ztx/recharge",
    method: "post",
    data: params
  })
}

export const consumeCostomer = params => {
  return axios.request({
    url: "ztx/consume",
    method: "post",
    data: params
  })
}

export const getConsumeSummary = params => {
  return axios.request({
    url: "ztx/consume",
    method: "get",
    data: params
  })
}

export const getRechargeSummary = params => {
  return axios.request({
    url: "ztx/recharge",
    method: "get",
    data: params
  })
}

export const getTradeList = params => {
  return axios.request({
    url: "ztx/trade/",
    method: "get",
    params: params
  })
}

export const getIncomeList = params => {
  return axios.request({
    url: "ztx/income/",
    method: "get",
    params: params
  })
}