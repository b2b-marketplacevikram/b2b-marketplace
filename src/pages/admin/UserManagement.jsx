import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import '../../styles/UserManagement.css'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [filterType])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = filterType === 'all' 
        ? await adminAPI.getAllUsers()
        : await adminAPI.getUsersByType(filterType)
      
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return
    }

    try {
      const result = await adminAPI.updateUserStatus(userId, !currentStatus)
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ))
        alert('User status updated successfully')
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('An error occurred')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const result = await adminAPI.deleteUser(userId)
      if (result.success) {
        setUsers(users.filter(user => user.id !== userId))
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred')
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    )
  })

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <div className="header-stats">
          <span>Total: {users.length}</span>
          <span>Active: {users.filter(u => u.isActive).length}</span>
          <span>Inactive: {users.filter(u => !u.isActive).length}</span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Users</option>
            <option value="buyer">Buyers</option>
            <option value="supplier">Suppliers</option>
          </select>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by email, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`type-badge type-${user.userType.toLowerCase()}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={user.isVerified ? 'verified' : 'not-verified'}>
                      {user.isVerified ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`btn-toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserManagement
