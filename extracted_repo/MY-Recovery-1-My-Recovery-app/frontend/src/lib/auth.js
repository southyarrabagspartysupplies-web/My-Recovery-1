export const saveToken = (token) => {
  localStorage.setItem('anchor_token', token);
};

export const getToken = () => {
  return localStorage.getItem('anchor_token');
};

export const removeToken = () => {
  localStorage.removeItem('anchor_token');
};

export const isAuthenticated = () => {
  return !!getToken();
};
