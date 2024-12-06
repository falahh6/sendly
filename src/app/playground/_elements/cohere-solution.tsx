"use client";

import { Button } from "@/components/ui/button";
import { ParsedEmail } from "@/lib/types/email";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DataItem = {
  text: string;
  label: string;
  id: string;
};

type CategorizedData = {
  section: string;
  items: DataItem[];
};

const categorizeDataByPrediction = (data: DataItem[]): CategorizedData[] => {
  const grouped: {
    section: string;
    items: { text: string; label: string; id: string }[];
  }[] = [];

  const sectionMap: {
    [key: string]: {
      section: string;
      items: { text: string; label: string; id: string }[];
    };
  } = {};

  data.forEach((item) => {
    const { label } = item;
    if (!sectionMap[label]) {
      sectionMap[label] = { section: label, items: [] };
      grouped.push(sectionMap[label]);
    }
    sectionMap[label].items.push(item);
  });

  return grouped;
};

export const CohereClassify = ({
  emails,
}: {
  emails: {
    section: string;
    emails: ParsedEmail[];
  }[];
}) => {
  useEffect(() => {}, []);
  const [classificationResults, setClassificationResults] = useState<
    {
      section: string;
      items: DataItem[];
    }[]
  >([]);

  const classifyEmails = async () => {
    const parsedEmail = emails.map((section) => section.emails).flat();

    const classificationInput = parsedEmail
      .map((email) => ({
        text: email.subject + "\n" + email.snippet,
        id: email.threadId,
      }))
      .slice(0, 95);

    console.log("CLASSIFICATION INPUT", classificationInput);

    const res = await fetch("/api/cohere/classify", {
      method: "POST",
      body: JSON.stringify({ inputs: classificationInput }),
    });

    const classificationResults = await res.json();

    console.log("CLASSIFICATION RESULTS", classificationResults);

    const parsedClassificationResults = classificationResults.data?.map(
      (result: { input: string; prediction: string; id: string }) => ({
        text: result.input,
        label: result.prediction,
        threadId: result.id,
      })
    );

    console.log("PARSED CLASSIFICATION RESULTS", parsedClassificationResults);

    console.log(
      "PARSED CLASSIFICATION RESULTS",
      categorizeDataByPrediction(parsedClassificationResults)
    );

    setClassificationResults(
      categorizeDataByPrediction(parsedClassificationResults)
    );
    // setClassifiedEmails(parsedClassificationResults.reduce<CategorizedData>((acc, item) => {
    //     if (!acc[item.prediction]) {
    //       acc[item.prediction] = [];
    //     }
    //     acc[item.prediction].push(item);
    //     return acc;
    //   }, {}))

    // setClassificationResults(
    //   classificationResults.data?.classifications.map((result: any) => ({
    //     text: result.input,
    //     label: result.prediction,
    //   }))
    // );
  };

  return (
    <div>
      <Button onClick={classifyEmails}>Classify</Button>

      <div>
        <Tabs
          defaultValue={
            classificationResults && classificationResults[0]?.section
          }
          className="w-full"
        >
          <TabsList className="mb-2">
            {classificationResults?.map((section, idx) => (
              <TabsTrigger key={idx + section.section} value={section.section}>
                {section.section} - {section.items?.length}
              </TabsTrigger>
            ))}
          </TabsList>
          <>
            {classificationResults.map((section, idx) => (
              <TabsContent
                key={idx + section.section}
                value={section.section}
                className="space-y-2 w-full"
              >
                {section.items.map((item) => (
                  <div key={item.id} className="p-2 bg-slate-200">
                    <p>{item.text}</p>
                  </div>
                ))}
              </TabsContent>
            ))}
          </>

          {/* {emails
        ?.map((section) => ({
          ...section,
          emails: section.emails.toSorted(
            (a, b) =>
              new Date(b.date ?? "").getTime() -
              new Date(a.date ?? "").getTime()
          ),
        }))
        .map((section, idx) => (
          <TabsContent
            key={idx + section.section}
            value={section.section}
            className="space-y-2 w-full"
          >
            {section.emails.map((email) => (
              <div>
                
              </div>
            ))}
          </TabsContent>
        ))} */}
        </Tabs>
      </div>
    </div>
  );
};
