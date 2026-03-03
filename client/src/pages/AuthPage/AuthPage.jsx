import LoginForm from "../../components/login/LoginForm";
import RegisterForm from "../../components/register/RegisterForm";
import OtpVerificationPage from "../OtpVerificationPage/OtpVerificationPage";
import { useNavigate } from "react-router-dom";

const AuthPage = ({ mode }) => {
  const isLogin = mode === "login";
  const isVerifyOtp = mode === "verify-otp";
  const navigate = useNavigate();

  const switchRoute = () => {
    navigate(isLogin ? "/auth/register" : "/auth/login");
  };

  // OTP page — keep as-is
  if (isVerifyOtp) {
    return <OtpVerificationPage />;
  }

  // Register — RegisterForm has its own full layout
  if (!isLogin) {
    return <RegisterForm />;
  }

  // Login — LoginForm manages its own full-screen split layout
  return <LoginForm />;
};

export default AuthPage;