import { Outlet } from "react-router-dom";

import StudentNavbar from "../components/student/StudentNavbar";

function StudentLayout() {
  return (
    <>
      <StudentNavbar />

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default StudentLayout;
