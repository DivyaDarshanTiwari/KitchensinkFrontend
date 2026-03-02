import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const jwtToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [validOrNot, setValidOrNot] = useState(false);

  const server__uri = import.meta.env.VITE_SERVER_COMMON_URI;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "ADMIN") {
          const response = await axios.get(`${server__uri}/members`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          setData(response.data);
          setValidOrNot(true);
        } else {
          const response = await axios.get(`${server__uri}/members/${userId}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          setData([response.data]);
          setValidOrNot(true);
        }
      } catch (error) {
        alert(error);
        setValidOrNot(false);
        navigate("/");
      }
    };
    fetchData();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      {validOrNot && (
        <div>
          <h2>Dashboard</h2>
          <div className="card-container">
            {data.map((user) => (
              <div key={user.id} className="cards">
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>PhoneNo. : {user.phoneNumber}</p>
              </div>
            ))}
          </div>
          <p>
            Want to LogOut? <button onClick={logout}>LogOut here</button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
