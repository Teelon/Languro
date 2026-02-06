"use client";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "@/components/Common/Loader";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Common/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoader(true);

    try {
      const res = await axios.post("/api/forgot-password/reset", {
        email: email.toLowerCase(),
      });

      if (res.status === 404) {
        toast.error("User not found.");
        return;
      }

      if (res.status === 200) {
        toast.success(res.data);
        setEmail("");
      }

      setEmail("");
      setLoader(false);
    } catch (error: any) {
      toast.error(error?.response?.data || "Something went wrong. Please try again.");
      setLoader(false);
    }
  };

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <Card className="mx-auto max-w-[500px] border-none shadow-none text-center">
              <CardContent className="p-4 md:p-12">
                <div className="mb-10 text-center">
                  <Logo className="mx-auto" />
                </div>

                <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-3xl">
                  Forgot Password?
                </h2>
                <p className="mb-10 text-base text-body-secondary">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-[22px]">
                    <Input
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="mb-9">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loader}
                    >
                      Send Reset Link {loader && <Loader />}
                    </Button>
                  </div>
                </form>

                <p className="text-body-secondary text-base">
                  Remember your password?{" "}
                  <Link href="/signin" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
