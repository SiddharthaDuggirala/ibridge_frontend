export const BASE_URL = import.meta.env.VITE_BASE_URL;

// Accounts
export const LOGIN = "api/accounts/login/";
export const CHANGEPASSWORD = "api/accounts/changepassword/";

// Workforce
export const GETDASHBOARD = "api/workforce/getdashboard/";


//Candidates 

export const CREATECANDIDATE = "api/recruitment/createcandidate/";
export const GETCANDIDATES = "api/recruitment/getcandidates/";
export const DELETECANDIDATES = "api/recruitment/deletecandidates/";
export const EDITCANDIDATE = "api/recruitment/editcandidate/"
export const MOVEEXIT = "api/recruitment/moveexit/";

// Clients
export const CREATECLIENT = "api/clients/createclient/"
export const EDITCLIENT = "api/clients/editclient/"
export const GETCLIENTS = "api/clients/getclients/";

// Proposals

export const CREATEPROPOSAL = "api/recruitment/createproposal/";
export const GETPROPOSALS = "api/recruitment/getproposals/";
export const GETPROPOSALHISTORY = "api/recruitment/getproposalhistory/";
export const MOVEPROPOSAL = "api/recruitment/moveproposal/";
export const EDITPROPOSAL = "api/recruitment/editproposal/";

// Team (system admin)
export const GETTEAM = "api/accounts/getteam/";
export const TRANSFEROWNERSHIP = "api/accounts/transferownership/";


export const ADDUSER = "api/accounts/adduser/";
export const SETREPORTING = "api/accounts/setreporting/";

// Onboarding
export const GETONBOARDINGS = "api/recruitment/getonboardings/";
export const MOVEONBOARDING = "api/recruitment/moveonboarding/";
export const GETPIPELINE = "api/recruitment/getpipeline/";
