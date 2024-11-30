"use client";

import { useEffect } from "react";

const EmailList = ({ emails }: { emails: ParsedEmail[] }) => {
  useEffect(() => {
    console.log("emails : ", emails);
  });

  return (
    <div className="p-10">
      {/* <Button onClick={call}>CALL</Button> */}
      <div>
        {emails &&
          emails?.map((email) => (
            <div key={email.threadId} className="p-2 border-b">
              <p className="font-semibold">{email.from}</p>
              <p>{email.subject}</p>
              <div>
                {/* <div
                  dangerouslySetInnerHTML={{ __html: email.htmlMessage || "" }}
                  style={{ background: "#ebeef4" }} 
                /> */}
              </div>
              <p>{email.date}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default EmailList;
