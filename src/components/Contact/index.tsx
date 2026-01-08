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
    <section id="contact" className="relative py-20 md:py-28 bg-[#f8faff] dark:bg-slate-950 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-900/50 dark:to-transparent -z-0"></div>

      <div className="container px-4 relative z-10">
        <div className="-mx-4 flex flex-wrap items-center lg:justify-between">
          <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
            <div className="mb-12 lg:mb-0">
              <div className="mb-8">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-widest text-primary">
                  Intelligence Support
                </span>
                <h2 className="mb-6 text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                  Ready to evolve your <span className="text-primary italic">learning strategy?</span>
                </h2>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  Whether you're looking for enterprise solutions or have a specific training question, our command center is standing by.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="mr-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-lg text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Field Office
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Digital First Architecture<br />
                      Remote-Native Support Team
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-lg text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Direct Channel
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      General: <a href="mailto:hello@languro.com" className="hover:text-primary transition-colors">hello@languro.com</a><br />
                      Support: <a href="mailto:support@languro.com" className="hover:text-primary transition-colors">support@languro.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
            <Card className="border-none shadow-2xl shadow-primary/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-slate-800 p-2 md:p-6">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  Transmission Details
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Send a secure message to our team and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Identifier
                      </Label>
                      <Input
                        type="text"
                        id="fullName"
                        placeholder="Commander Name"
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Return Protocol
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="email@example.com"
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Objective
                    </Label>
                    <Input
                      type="text"
                      id="subject"
                      placeholder="What is your request regarding?"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Message Payload
                    </Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="Type your transmission here..."
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 resize-none focus:ring-primary"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 shadow-lg shadow-primary/20 transition-all duration-300">
                    Initiate Transmission
                  </Button>
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
