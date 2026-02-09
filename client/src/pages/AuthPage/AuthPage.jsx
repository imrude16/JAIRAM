import LoginForm from "../../components/login/LoginForm";
import RegisterForm from "../../components/register/RegisterForm";

const AuthPage = ({ mode }) => {
  const isLogin = mode === "login";

  const switchRoute = () => {
    window.location.hash = isLogin ? "#/auth/register" : "#/auth/login";
  };

  // For Register page - no wrapper needed as RegisterForm has its own layout
  if (!isLogin) {
    return <RegisterForm />;
  }

  // For Login page - add proper wrapper
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
          Log In
          </h1>
          <p className="text-slate-600 text-sm">
            Access your journal dashboard and submissions
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <LoginForm />
        </div>

        {/* Footer switch */}
        <div className="text-center mt-6">
          <p className="text-slate-600 text-sm">
            New author?{" "}
            <button
              onClick={switchRoute}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;