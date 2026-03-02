import { useState } from "react";
import { useNavigate ,Link} from "react-router-dom";
import axios from "axios";
import "../css/formCss.css"

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage , setErrorMessage] = useState("")

  const server_uri = import.meta.env.VITE_SERVER_COMMON_URI

  const handleSign = async (e) => {
    e.preventDefault();
    try{
        const userDetails= {
            name: username,
            email: email,
            phoneNumber: phoneNumber,
            password: password
        }
      const response = await axios.post(`${server_uri}/auth/signUp`, userDetails);
      if(response.status == 200){
        alert("SignUp Successful")
        navigate(`/`)
      }
      else{
        alert(response.message || "Signup failed");
      }

    }catch(error){
      console.warn(error.response.data)
      if(error.response.data.error){
        setErrorMessage(error.response.data.error)
      }else{
        const errorMessage = error.response.data.reduce((current,data) => {return data.error +" + "+ current } , " ");
        console.log(errorMessage)
        setErrorMessage(errorMessage);
      }
    }
  };

  return (
    <div className="form">
      <h2>SignUp</h2>
      <form onSubmit={handleSign}>
        <input
          type="username"
          placeholder="Enter UserName"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="phoneNumber"
          placeholder="Enter Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required />
        <button type="submit">SignUp</button>
      </form>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <p>Already have an account? <Link to="/">Login here</Link></p>
    </div>
  );
};

export default SignUp;