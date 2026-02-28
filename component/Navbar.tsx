import { Box } from "lucide-react";
import React from "react";
import Button from "./ui/Button";
import { useOutlet, useOutletContext } from "react-router";

const Navbar = () => {
  
 const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    if (isSignedIn) {
       try{
            await signOut();
       }catch(error){
            console.error("Error signing out:", error);
       }
       return;
    } else {
        try{
            await signIn();
        }
        catch(error){
            console.error("Error signing in:", error);
        }
    }
  };
  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>
          <ul className="links">
            <a href="http://">Product</a>
            <a href="http://">Pricing</a>
            <a href="http://">Community</a>
            <a href="http://">Enterprise</a>
          </ul>
        </div>
        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi,${userName}` : "Signed in"}

                <Button size="sm" onClick={handleAuthClick} className="btn">
                  Log Out
                </Button>
              </span>
            </>
          ) : (
            <>
              <Button onClick={handleAuthClick} size="sm" variant="ghost">
                Log In
              </Button>
              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
