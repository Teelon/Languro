"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { validateEmail } from "@/utils/validateEmail";
import Loader from "@/components/Common/Loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MagicLink = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Please enter your email address.");
    }

    setLoader(true);
    if (!validateEmail(email)) {
      setLoader(false);
      return toast.error("Please enter a valid email address.");
    } else {
      signIn("email", {
        redirect: false,
        email: email,
      })
        .then((callback) => {
          if (callback?.ok) {
            toast.success("Email sent");
            setEmail("");
            setLoader(false);
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error("Unable to send email!");
          setLoader(false);
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[22px]">
        <Input
          type="email"
          placeholder="Email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className="w-full"
        />
      </div>
      <div className="mb-9">
        <Button
          type="submit"
          className="w-full"
        >
          Send Magic Link {loader && <Loader />}
        </Button>
      </div>
    </form>
  );
};

export default MagicLink;
