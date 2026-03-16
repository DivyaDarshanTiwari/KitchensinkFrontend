import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: [],
  });
  const [size] = useState(5);
  const [number, setNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState("asc");

  const [lastSortValue, setLastSortValue] = useState(null);
  const [lastId, setLastId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: ["MEMBER"],
  });

  const jwtToken = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [validOrNot, setValidOrNot] = useState(false);

  const server__uri = import.meta.env.VITE_SERVER_COMMON_URI;

  const fetchData = async (resetData = true) => {
    try {
      setLoading(true);
      if (role === "ADMIN") {
        const params = new URLSearchParams({
          page: resetData ? 0 : number,
          size: size,
          sortBy: sortBy,
          direction: direction,
        });

        if (searchQuery) params.append("searchQuery", searchQuery);
        if (!resetData && lastSortValue)
          params.append("lastSortValue", lastSortValue);
        if (!resetData && lastId) params.append("lastId", lastId);

        const response = await axios.get(
          `${server__uri}/admin/members?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );

        if (resetData) {
          setData(response.data.content);
          setNumber(0);
        } else {
          setData((prevData) => [...prevData, ...response.data.content]);
        }

        setHasMore(response.data.hasNext);
        setLastSortValue(response.data.lastSortValue);
        setLastId(response.data.lastId);
        setValidOrNot(true);
      } else {
        const response = await axios.get(`${server__uri}/members/me`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setData([response.data]);
        setEditData({
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
        });
        setValidOrNot(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message);
      setValidOrNot(false);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy, direction]);

  const handleSearch = (e) => {
    e.preventDefault();
    setNumber(0);
    setLastSortValue(null);
    setLastId(null);
    fetchData(true);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNewMemberChange = (e) => {
    setNewMember({
      ...newMember,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e, isNewMember = false) => {
    const selectedRole = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    if (isNewMember) {
      setNewMember({ ...newMember, role: selectedRole });
    } else {
      setEditData({ ...editData, role: selectedRole });
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${server__uri}/members/me`, editData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      const response = await axios.get(`${server__uri}/members/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const updatedUser = response.data;
      setData([{ ...updatedUser }]);
      setEditData({
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
      });

      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(
        "Update failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const handleAdminUpdate = async () => {
    try {
      await axios.put(
        `${server__uri}/admin/member`,
        { ...editData, id: editingUserId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      fetchData(true);
      setEditMode(false);
      setEditingUserId(null);
      alert("Member updated successfully!");
    } catch (error) {
      alert(
        "Update failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const handleAddMember = async () => {
    try {
      await axios.post(`${server__uri}/admin/member`, newMember, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      setShowAddModal(false);
      setNewMember({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: ["MEMBER"],
      });
      fetchData(true);
      alert("Member added successfully!");
    } catch (error) {
      alert("Add failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await axios.delete(`${server__uri}/admin/member/${memberId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      fetchData(true);
      alert("Member deleted successfully!");
    } catch (error) {
      alert(
        "Delete failed: " + (error.response?.data?.message || error.message),
      );
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role || [],
    });
    setEditMode(true);
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditingUserId(null);
    setEditData({
      name: "",
      email: "",
      phoneNumber: "",
      role: [],
    });
  };

  const handlePagination = async () => {
    const nextPage = number + 1;
    setNumber(nextPage);
    fetchData(false);
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${server__uri}/auth/logout`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response) {
        localStorage.clear();
        navigate("/");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      {validOrNot && (
        <div>
          <h2>Dashboard</h2>

          {role === "ADMIN" && (
            <div className="admin-controls">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search members by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>

              <div className="sort-controls">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="id">Sort by ID</option>
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                </select>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <button
                className="add-member-btn"
                onClick={() => setShowAddModal(true)}
              >
                Add New Member
              </button>
            </div>
          )}

          <div className="card-container">
            {data.map((user) => (
              <div key={user.id} className="cards">
                {editMode && (role !== "ADMIN" || editingUserId === user.id) ? (
                  <>
                    <label htmlFor="editName">Name:</label>
                    <input
                      id="editName"
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                    />

                    <label htmlFor="editEmail">Email:</label>
                    <input
                      id="editEmail"
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />

                    <label htmlFor="editPhoneNumber">Phone:</label>
                    <input
                      id="editPhoneNumber"
                      type="text"
                      name="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />

                    {role === "ADMIN" && !user.role?.includes("ADMIN") && (
                      <>
                        <label htmlFor="selectRole">Role:</label>
                        <select
                          id="selectRole"
                          multiple
                          value={editData.role}
                          onChange={(e) => handleRoleChange(e, false)}
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </>
                    )}

                    <div className="button-container">
                      <button
                        className="primary"
                        onClick={
                          role === "ADMIN" ? handleAdminUpdate : handleUpdate
                        }
                      >
                        Save
                      </button>
                      <button
                        className="secondary"
                        onClick={
                          role === "ADMIN"
                            ? cancelEditing
                            : () => setEditMode(false)
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="user-name">{user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phoneNumber}</p>
                    {user.role && <p>Role: {user.role.join(", ")}</p>}

                    {role === "ADMIN" ? (
                      !user.role?.includes("ADMIN") && (
                        <div className="button-container">
                          <button
                            className="primary"
                            onClick={() => startEditing(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="danger"
                            onClick={() => handleDeleteMember(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        className="primary"
                        onClick={() => setEditMode(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {role === "ADMIN" && hasMore && (
            <div className="load-more-section">
              <button
                className="load-more-btn"
                onClick={handlePagination}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Add New Member</h3>

                <label htmlFor="new-name">Name:</label>
                <input
                  id="new-name"
                  type="text"
                  name="name"
                  value={newMember.name}
                  onChange={handleNewMemberChange}
                  placeholder="Enter name"
                />

                <label htmlFor="new-email">Email:</label>
                <input
                  id="new-email"
                  type="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleNewMemberChange}
                  placeholder="Enter email"
                />

                <label htmlFor="new-phone">Phone:</label>
                <input
                  id="new-phone"
                  type="text"
                  name="phoneNumber"
                  value={newMember.phoneNumber}
                  onChange={handleNewMemberChange}
                  placeholder="Enter phone number"
                />

                <label htmlFor="new-password">Password:</label>
                <input
                  id="new-password"
                  type="password"
                  name="password"
                  value={newMember.password}
                  onChange={handleNewMemberChange}
                  placeholder="Enter password"
                />

                <label htmlFor="new-role">Role:</label>
                <select
                  id="new-role"
                  multiple
                  value={newMember.role}
                  onChange={(e) => handleRoleChange(e, true)}
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <div className="button-container">
                  <button className="primary" onClick={handleAddMember}>
                    Add Member
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="logout-section">
            <p>Want to LogOut?</p>
            <button onClick={logout}>LogOut</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
