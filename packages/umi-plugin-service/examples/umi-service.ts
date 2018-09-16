import axios from "axios";

/**
 * login services
 * @param data
 */
export function login(data: { [key: string]: any } = {}) {
  const { ...restData } = data;
  return axios({
    url: `/login`,
    method: "POST",
    data: restData
  });
}

/**
 * logout services
 * @param data
 */
export function logout(data: { [key: string]: any } = {}) {
  const { ...restData } = data;
  return axios({
    url: `/logout`,
    params: restData
  });
}

/**
 * getUser services
 * @param data
 */
export function getUser(data: { [key: string]: any } = {}) {
  const { userId, info, ...restData } = data;
  return axios({
    url: `/login/${userId}/${info}`,
    params: restData
  });
}
