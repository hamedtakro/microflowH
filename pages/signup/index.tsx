import { Button, InputAdornment, TextField, Theme, Typography } from "@mui/material";

import { makeStyles, createStyles } from "@mui/styles";
import { Box } from "@mui/system";
import loginLogo from "../../images/login.svg";
import Link from "next/link";
import Image from "next/image";
import googleIcon from "../../images/google.svg";
import discordIcon from "../../images/discord.svg";
import { ChangeEvent, FocusEvent, MouseEvent, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const useStyles = makeStyles((theme: Theme) =>
   createStyles({
      icons: {
         marginRight: "8px",
      },
   })
);

export default function SignUp() {
   const classes = useStyles();

   const [password, setPassword] = useState<string>("");
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [repeatPassword, setRepeatPassword] = useState<string>("");
   const [repeatPasswordError, setRepeatPasswordError] = useState<string>("");
   const [showRepeatPassword, setShowRepeatPassword] = useState<boolean>(false);
   const [email, setEmail] = useState<string>("");
   const [emailError, setemailError] = useState<string>("");
   //    const [emailIsValid, setEmailIsValid] = useState<boolean>(true);
   // const [passwordIsValid, setPasswordIsValid] = useState<boolean>(true);

   const repeatPasswordChangeHandler = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const repeatPassTemp = event.target.value.trim();
      setRepeatPassword(repeatPassTemp);

      if (repeatPassTemp === password) {
         // password and it's repeat are the same ...

         setRepeatPasswordError("");
      } else {
         setRepeatPasswordError("Password and repeat password does not match");
      }
   };

   const emailBlurHandler = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
      setShowPassword(false);
      setEmail(event.target.value.trim());

      if (event.target.value.trim() === "") {
         //    setEmailIsValid(false);
         setemailError("Email is empty");
         return;
      }
      const emailIsValidTemp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(event.target.value);
      // setEmailIsValid(emailIsValidTemp);
      if (!emailIsValidTemp) {
         setemailError("Email format is wrong");
      } else {
         setemailError("");
      }
   };

   const signUpHandler = (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      if (email === "") {
         //    setEmailIsValid(false);
         setemailError("Email is empty");
         return;
      }

      const emailIsValidTemp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);

      // setEmailIsValid(emailIsValidTemp);
      if (!emailIsValidTemp) {
         setemailError("Email format is wrong");
      } else {
         setemailError("");
      }
      /*** password validation check */
   };

   return (
      <Box
         sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            mx: "auto",
            maxWidth: "78.25rem",
         }}
      >
         <Box>
            <Image width={650} height={864} src={loginLogo} alt="logo image"></Image>
         </Box>
         <Box
            sx={{
               width: "41rem",
               height: "54rem",
               margin: "2.5rem 0 0 5rem",
               display: "flex",
               flexDirection: "column",
            }}
         >
            <Box>
               <Typography fontWeight={700} fontSize={40}>
                  Signup
               </Typography>
               <Box sx={{ mt: "3.5rem" }}>
                  <TextField
                     required
                     fullWidth
                     label="Email"
                     type="email"
                     error={emailError !== ""}
                     helperText={emailError}
                     onBlur={emailBlurHandler}
                  ></TextField>
               </Box>
               <Box sx={{ mt: "1rem" }}>
                  <TextField
                     required
                     fullWidth
                     label="Password"
                     onChange={(event) => setPassword(event.target.value)}
                     type={showPassword ? "text" : "password"}
                     InputProps={{
                        endAdornment: (
                           <InputAdornment
                              sx={{ cursor: "pointer" }}
                              onClick={() => setShowPassword(!showPassword)}
                              position="end"
                           >
                              {!password ? null : showPassword ? <VisibilityOff /> : <Visibility />}
                           </InputAdornment>
                        ),
                     }}
                  ></TextField>
                  <Box />
                  <Box sx={{ mt: "1rem" }}>
                     <TextField
                        required
                        fullWidth
                        label="Repeated Password"
                        error={repeatPasswordError !== ""}
                        onChange={repeatPasswordChangeHandler}
                        helperText={repeatPasswordError}
                        type={showRepeatPassword ? "text" : "password"}
                        InputProps={{
                           endAdornment: (
                              <InputAdornment
                                 sx={{ cursor: "pointer" }}
                                 onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                 position="end"
                              >
                                 {!repeatPassword ? null : showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                              </InputAdornment>
                           ),
                        }}
                     ></TextField>
                  </Box>
               </Box>
               <Button fullWidth onClick={signUpHandler} type="submit" sx={{ mt: "2.5rem" }} variant="contained">
                  <Typography sx={{ fontWeight: "600" }}>Signup</Typography>
               </Button>
               <Button sx={{ mt: "2.5rem", mb: "0.75rem" }} variant="outlined" fullWidth>
                  <Image className={classes.icons} src={googleIcon} alt="google icon"></Image>
                  Continue with <b>&nbsp;Google</b>
               </Button>
               <Button variant="outlined" fullWidth>
                  <Image className={classes.icons} src={discordIcon} alt="discord icon" />
                  Continue with
                  <b>&nbsp;Discord</b>
               </Button>
            </Box>
            <Typography sx={{ color: "#1D1F61", textDecoration: "none", mt: "11.5rem", textAlign: "center" }}>
               Already have an account?
               <Link
                  style={{
                     textDecoration: "none",
                     color: "#1D1F61",
                     fontWeight: "bold",
                  }}
                  href="/login"
               >
                  {" "}
                  Login
               </Link>
            </Typography>
         </Box>
      </Box>
   );
}
