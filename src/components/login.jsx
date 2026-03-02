import { useState } from "react";
import { useNavigate ,Link } from "react-router-dom";
import axios from "axios";
import "../css/formCss.css"
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage , setErrorMessage] = useState("")

  const server__uri = import.meta.env.VITE_SERVER_COMMON_URI;

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(email , password)
    try{
      const emailAndPassword = {
        email : email,
        password: password
      }
      const response = await axios.post(`${server__uri}/auth/login` , emailAndPassword);
      const data = response.data;
      if(response.status == 200){
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role",data.roles)
        alert("Login Successful")
        navigate("/dashboard")
      }
      else{
        alert(data.message || "Login failed");
      }

    }catch(error){
      if(error.response.data.error){
        setErrorMessage(error.response.data.error)
      }else{
        const errorMessage = error.response.data.reduce((current,data) => {return data.error +" + "+ current } , " ");
        setErrorMessage(errorMessage);
      }
    }
  };

  return (
    <div className="form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required />
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
};

export default Login;