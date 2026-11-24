import {BrowserRouter, Routes, Route} from "react-router";
import {AppLayout} from "@/components/layout/app-layout";
import {NAV_ITEMS} from "@/components/layout/navigation";
import {NotFoundPage} from "@/pages/not-found-page";
import {PlaceholderPage} from "@/pages/placeholder-page";
import {HomePage} from "@/pages/home-page";
import {LoginPage} from "@/pages/login-page";
import {ProtectedRoute} from "@/components/layout/protected-route";
import {CandidatesPage} from "@/pages/candidates-page";
import {CandidateDetailPage} from "@/pages/candidate-detail-page";
import {ProposalPage} from "@/pages/proposals-page";
import {TeamPage} from "@/pages/team-page";
import {OnboardingPage} from "@/pages/onboarding-page";
import {PipelinePage} from "@/pages/pipeline-page";


const BUILT_PATHS = ["/", "/candidates", "/proposals", "/team", "/onboarding", "/pipeline"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element= {<ProtectedRoute/>}>
              <Route element= {<AppLayout/>}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/candidates/:id" element={<CandidateDetailPage />} />
                  <Route path="/candidates" element={<CandidatesPage />} />
                  <Route path="/proposals" element={<ProposalPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/pipeline" element={<PipelinePage />} />
                {NAV_ITEMS.filter((item) => !BUILT_PATHS.includes(item.path)).map((item) => (
                  <Route
                    key={item.path}
                    path={item.path}
                    element={<PlaceholderPage title={item.label} />}
                  />
                ))}

              </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
   
    
  );
}

export default App;