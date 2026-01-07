import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Contact = () => {
  return (
    <section id="contact" className="relative py-16 md:py-20">
      <div className="absolute left-0 top-0 -z-[1] h-full w-full dark:bg-dark"></div>
      <div className="absolute left-0 top-0 -z-[1] h-1/2 w-full bg-[#E9F9FF] dark:bg-dark-700 lg:h-[45%] xl:h-1/2"></div>
      <div className="container px-4">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div className="ud-contact-content-wrapper">
              <div className="ud-contact-title mb-12 lg:mb-[100px]">
                <span className="mb-6 block text-base font-medium text-dark dark:text-white">
                  CONTACT US
                </span>
                <h2 className="max-w-[260px] text-[35px] font-semibold leading-[1.14] text-dark dark:text-white">
                  Let&#39;s talk about your problem.
                </h2>
              </div>
              <div className="mb-12 flex flex-wrap justify-between lg:mb-0">
                <div className="mb-8 flex w-[330px] max-w-full">
                  <div className="mr-6 text-primary">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-[18px] text-lg font-semibold text-dark dark:text-white">
                      Our Location
                    </h3>
                    <p className="text-base text-body-color dark:text-dark-6">
                      401 Broadway, 24th Floor, Orchard Cloud View, London
                    </p>
                  </div>
                </div>
                <div className="mb-8 flex w-[330px] max-w-full">
                  <div className="mr-6 text-primary">
                    <Mail className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-[18px] text-lg font-semibold text-dark dark:text-white">
                      How Can We Help?
                    </h3>
                    <p className="text-base text-body-color dark:text-dark-6">
                      info@yourdomain.com
                    </p>
                    <p className="mt-1 text-base text-body-color dark:text-dark-6">
                      contact@yourdomain.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <Card className="shadow-lg dark:bg-slate-800 border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-dark dark:text-white">
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="mb-4">
                    <Label htmlFor="fullName" className="mb-2 block">
                      Full Name*
                    </Label>
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Adam Gelius"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="email" className="mb-2 block">
                      Email*
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="example@yourmail.com"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="phone" className="mb-2 block">
                      Phone*
                    </Label>
                    <Input
                      type="text"
                      name="phone"
                      placeholder="+885 1254 5211 552"
                    />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="message" className="mb-2 block">
                      Message*
                    </Label>
                    <Textarea
                      name="message"
                      rows={4}
                      placeholder="Type your message here"
                    />
                  </div>
                  <div className="mb-0">
                    <Button type="submit" size="lg" className="w-full">
                      Send
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
