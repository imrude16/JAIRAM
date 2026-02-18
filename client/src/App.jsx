import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import ArticlesPage from "./pages/ArticlesPage/ArticlesPage";
import IssuesPage from "./pages/IssuePage/IssuePage";
import SubmitPage from "./pages/SubmitPage/SubmitPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import ArticleDetail from "./components/articles/ArticleDetail/ArticleDetail";
import AuthPage from "./pages/AuthPage/AuthPage";
import MinimalHeader from "./components/layout/Header/MinimalHeader";
import EditorialBoard from "./pages/Editor-Board/EditorialBoard";
import ManuscriptLoginPage from "./pages/ManuscriptLoginPage/ManuscriptLoginPage";
import PoweredTrustPage from "./pages/PoweredTrustPage/PoweredTrustPage";
import OtpVerificationPage from "./pages/OtpVerificationPage/OtpVerificationPage";

// import SearchResults from "./pages/SearchResults/SearchResults";
// import NotFound from "./pages/NotFound/NotFound";
import "./App.css";
import FAQPage from "./pages/FAQ_Page/FAQPage";
import EthicsPage from "./pages/EthicsPage/EthicsPage";
import Author from "./pages/AuthorGuidelines/Author";
import PeerReviewSystem from "./pages/PeerReviewSystem/PeerReviewSystem";
import ArticleProcessingCharge from "./pages/ArticleProcessingCharge/ArticleProcessingCharge";

// Layout wrapper component
const Layout = ({ children, minimal = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {minimal ? <MinimalHeader /> : <Header />}

      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
};

// Animated page transition wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <Layout>
              <PageTransition>
                <HomePage />
              </PageTransition>
            </Layout>
          }
        />

        {/* Articles Routes */}
        <Route
          path="/articles"
          element={
            <Layout>
              <PageTransition>
                <ArticlesPage />
              </PageTransition>
            </Layout>
          }
        />

        <Route
          path="/articles/:id"
          element={
            <Layout>
              <PageTransition>
                <ArticleDetail />
              </PageTransition>
            </Layout>
          }
        />

        {/* Issues Route */}
        <Route
          path="/issues"
          element={
            <Layout>
              <PageTransition>
                <IssuesPage />
              </PageTransition>
            </Layout>
          }
        />

        {/* APC Route */}
        <Route
          path="/authors-guidelines"
          element={
            <Layout>
              <PageTransition>
                <Author />
              </PageTransition>
            </Layout>
          }
        />
        <Route
          path="/manuscript-login"
          element={
            <PageTransition>
              <ManuscriptLoginPage />
            </PageTransition>
          }
        />

        {/* Submit Route */}
        <Route
          path="/submit"
          element={
            
              <PageTransition>
                <SubmitPage />
              </PageTransition>
           
          }
        />

        {/* Editor Page Route */}
        <Route
          path="/editorial-board"
          element={
            <Layout>
              <PageTransition>
                <EditorialBoard />
              </PageTransition>
            </Layout>
          }
        />

        {/* Ethics Page Route */}
        <Route
          path="/ethics"
          element={
            <Layout>
              <PageTransition>
                <EthicsPage />
              </PageTransition>
            </Layout>
          }
        />

        {/* About Route */}
        <Route
          path="/about"
          element={
            <Layout>
              <PageTransition>
                <AboutPage />
              </PageTransition>
            </Layout>
          }
        />

        {/* APC Routes */}
        <Route
          path="/faqs"
          element={
            <Layout>
              <PageTransition>
                <FAQPage />
              </PageTransition>
            </Layout>
          }
        />

        {/* Peer Review System Routes */}
        <Route
          path="/peer-review-process"
          element={
            <Layout>
              <PageTransition>
                <PeerReviewSystem />
              </PageTransition>
            </Layout>
          }
        />

        {/* Article Processing Charge Routes */}
        <Route
          path="/article-processing-charge"
          element={
            <Layout>
              <PageTransition>
                <ArticleProcessingCharge />
              </PageTransition>
            </Layout>
          }
        />
        <Route
          path="/powered-trust"
          element={
            <Layout>
              <PageTransition>
                <PoweredTrustPage />
              </PageTransition>
            </Layout>
          }
        />

        {/* Contact Route */}
        <Route
          path="/contact"
          element={
            <Layout>
              <PageTransition>
                <ContactPage />
              </PageTransition>
            </Layout>
          }
        />

        {/* Auth Route */}
        {/* Redirect /auth to login */}
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route
          path="/auth/login"
          element={
            <Layout minimal>
              <AuthPage mode="login" />
            </Layout>
          }
        />

        <Route
          path="/auth/register"
          element={
            <Layout minimal>
              <AuthPage mode="register" />
            </Layout>
          }
        />
        <Route
          path="/auth/verify-otp"
          element={
            <Layout minimal>
              <OtpVerificationPage />
            </Layout>
          }
        />

        {/* Search Results Route */}
        <Route
          path="/search"
          element={
            <Layout>
              <PageTransition>{/* <SearchResults /> */}</PageTransition>
            </Layout>
          }
        />

        {/* Redirect old routes */}
        <Route path="/current-issue" element={<Navigate to="/" replace />} />
        <Route path="/all-issues" element={<Navigate to="/issues" replace />} />

        {/* 404 Not Found Route */}
        <Route
          path="*"
          element={
            <Layout>
              <PageTransition>{/* <NotFound /> */}</PageTransition>
            </Layout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// App wrapper with Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
