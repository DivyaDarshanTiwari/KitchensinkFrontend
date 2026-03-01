import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const jwtToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchData = async () => {
      try{
      if (role === "ADMIN") {
        const response = await axios.get(
          "http://localhost:8080/kitchensink/rest/members",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );
        setData(response.data);
      } else {
        const response = await axios.get(
          `http://localhost:8080/kitchensink/rest/members/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );
        setData([response.data]);
      }
      }catch(error){
        alert(error);
      }
      
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card-container">
        {data.map((user) => (
          <div key={user.name} className="cards">
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>PhoneNo. : {user.phoneNumber}</p>
          </div>
        ))}
      </div>
      <p>
        Want to LogOut? <Link to="/">LogOut here</Link>
      </p>
    </div>
  );
};

export default Dashboard;
