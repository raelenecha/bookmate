import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
    const [headerProps, setHeaderProps] = useState({});

    return (
        <>
            <Header {...headerProps} />
            <main>
                <Outlet context={{ setHeaderProps }} />
            </main>
        </>
    )
}

export default Layout