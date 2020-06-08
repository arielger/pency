import React from "react";
import {Amplitude, AmplitudeProvider} from "@amplitude/react-amplitude";
import {AmplitudeClient, Identify} from "amplitude-js";

export default function Provider({children}) {
    if (!process.browser) return children;

    const amplitude = require("amplitude-js");
    const amplitudeInstance: AmplitudeClient = amplitude.getInstance();
    amplitudeInstance.init(process.env.AMPLITUDE_API_KEY, null, {
      userId, // @TODO: add user id
      logLevel: process.env.NODE_ENV === "production" ? "DISABLE" : "INFO",
      includeGclid: true,
      includeReferrer: true, // https://help.amplitude.com/hc/en-us/articles/215131888#track-referrers
      includeUtm: true,
      onError: (error): void => {
        console.error(error); // eslint-disable-line no-console
      },
    });

    if (amplitudeInstance.isNewSession()) {
      const visitor: Identify = new amplitudeInstance.Identify();

      // @TODO: Complete with user data

      // XXX We must set all other "must-have" properties here (instead of below, as userProperties), because react-amplitude will send the next "page-displayed" event BEFORE sending the $identify event
      //  Thus, it'd store the first event with an associated user who has not defined "customer.ref", "lang", etc... and that'd break our stats (following events would be correct, only the first event of a new user would be wrong)
      // visitor.setOnce("customer.ref", layoutProps.customerRef);
      // visitor.setOnce("lang", pageProps.lang);

      amplitudeInstance.identify(visitor);

    return (
      <AmplitudeProvider
        amplitudeInstance={amplitudeInstance}
        apiKey={process.env.AMPLITUDE_API_KEY}
        userId={userId}
      >
          {/*
            Pass props common for all events
            See https://github.com/amplitude/react-amplitude#eventproperties
          */}
          <Amplitude eventProperties={{
              page: {
                url: location.href,
                path: location.pathname,
                origin: location.origin,
                name: null,
              },
            //   lang: pageProps.lang,
          }}>

          </Amplitude>
        {children}
      </AmplitudeProvider>
    );
};