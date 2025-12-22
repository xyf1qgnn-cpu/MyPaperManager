import api from './api';

/**
 * 获取用户个人资料
 * 对应后端 GET /api/user/profile
 */
export const getProfile = async () => {
  // 后端目前可能没有专门的 /profile 接口，但有 /auth/me
  // 假设根据 Task 描述，我们应该调用 /user/profile 或 /auth/me
  // 如果后端没实现 /user/profile，我们先尝试 /auth/me 并假设它返回 profile 信息
  // 根据 Task Context: GET /api/user/profile
  return await api.get('/user/profile').catch(async (err) => {
    // Fallback if /user/profile not implemented yet
    if (err.status === 404) {
      console.warn('/user/profile not found, falling back to /auth/me');
      return await api.get('/auth/me');
    }
    throw err;
  });
};

/**
 * 更新用户个人资料
 * 对应后端 PUT /api/user/profile
 * @param {Object} data - { username, bio, avatar }
 */
export const updateProfile = async (data) => {
  return await api.put('/user/profile', data);
};

/**
 * 更新用户设置 (如 API Key)
 * 对应后端 PUT /api/user/settings
 * @param {Object} data - { deepseekApiKey }
 */
export const updateSettings = async (data) => {
  return await api.put('/user/settings', data);
};
