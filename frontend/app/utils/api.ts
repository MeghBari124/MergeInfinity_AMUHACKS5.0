import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get('token')

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async getProfile() {
    return this.request('/api/auth/profile')
  }

  async getLeaderboard() {
    return this.request('/api/auth/leaderboard')
  }

  // Issue endpoints
  async createIssue(description: string, image: string | null, location: any) {
    return this.request('/api/issues/create', {
      method: 'POST',
      body: JSON.stringify({ description, image, location }),
    })
  }

  async getMyReports() {
    return this.request('/api/issues/my-reports')
  }

  /**
   * Resolve an issue (Student side)
   * Matches PUT /api/issues/<issue_id>/resolve
   */
  async resolveIssue(issueId: string) {
    return this.request(`/api/issues/${issueId}/resolve`, {
      method: 'PUT',
    })
  }

  // Admin endpoints
  async getAllIssues() {
    return this.request('/api/admin/issues')
  }

  /**
   * Update issue status (Admin side)
   * Matches PUT /api/admin/issues/<issue_id>/status
   */
  async updateIssueStatus(issueId: string, status: string) {
    return this.request(`/api/admin/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async getDashboardStats() {
    return this.request('/api/admin/dashboard')
  }

  // Analytics endpoints
  async getCategoryAnalytics() {
    return this.request('/api/analytics/categories')
  }

  async getUrgencyAnalytics() {
    return this.request('/api/analytics/urgency')
  }

  async getTrendAnalytics() {
    return this.request('/api/analytics/trends')
  }
}

export const api = new ApiClient(API_BASE_URL)
