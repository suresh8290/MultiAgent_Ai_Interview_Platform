
import React from "react";

const inputClass =
  "w-full rounded-md border border-black/20 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-black/30 focus:border-black/60";

const labelClass =
  "text-[10px] font-semibold uppercase tracking-wider text-black/70";

const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => (
  <div className="flex flex-col gap-1">
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 3,
}) => (
  <div className="flex flex-col gap-1">
    <label className={labelClass}>{label}</label>
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputClass} resize-y`}
    />
  </div>
);

const EntryCard = ({ title, onRemove, children }) => (
  <div className="rounded-lg border border-black/10 bg-white p-4">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-md px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
      >
        Remove
      </button>
    </div>

    <div className="flex flex-col gap-3">{children}</div>
  </div>
);

const updateEntry = (setData, key, index, field, value) => {
  setData((prev) => ({
    ...prev,
    [key]: (prev[key] || []).map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ),
  }));
};

const addEntry = (setData, key, newEntry) => {
  setData((prev) => ({
    ...prev,
    [key]: [...(prev[key] || []), { ...newEntry }],
  }));
};

const removeEntry = (setData, key, index) => {
  setData((prev) => ({
    ...prev,
    [key]: (prev[key] || []).filter((_, i) => i !== index),
  }));
};

const ResumeForm = ({ step, data, setData }) => {
  if (!data) return null;

  const updateField = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const renderInput = (
    label,
    key,
    placeholder = "",
    type = "text"
  ) => (
    <Input
      label={label}
      value={data[key]}
      placeholder={placeholder}
      type={type}
      onChange={(value) => updateField(key, value)}
    />
  );

  const renderEntryInput = (
    key,
    index,
    field,
    label,
    placeholder = "",
    type = "text"
  ) => (
    <Input
      label={label}
      value={data[key][index][field]}
      placeholder={placeholder}
      type={type}
      onChange={(value) =>
        updateEntry(setData, key, index, field, value)
      }
    />
  );

  const renderEntryTextArea = (
    key,
    index,
    field,
    label,
    placeholder = ""
  ) => (
    <TextArea
      label={label}
      value={data[key][index][field]}
      placeholder={placeholder}
      onChange={(value) =>
        updateEntry(setData, key, index, field, value)
      }
    />
  );

  const renderEntries = (
    key,
    title,
    blankEntry,
    fields,
    buttonText
  ) => (
    <div className="flex flex-col gap-4">
      {(data[key] || []).map((item, index) => (
        <EntryCard
          key={index}
          title={`${title} ${index + 1}`}
          onRemove={() => removeEntry(setData, key, index)}
        >
          {fields.map((field) =>
            field.type === "textarea" ? (
              <TextArea
                key={field.key}
                label={field.label}
                value={item[field.key]}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                onChange={(value) =>
                  updateEntry(
                    setData,
                    key,
                    index,
                    field.key,
                    value
                  )
                }
              />
            ) : (
              <Input
                key={field.key}
                label={field.label}
                value={item[field.key]}
                placeholder={field.placeholder}
                type={field.type || "text"}
                onChange={(value) =>
                  updateEntry(
                    setData,
                    key,
                    index,
                    field.key,
                    value
                  )
                }
              />
            )
          )}
        </EntryCard>
      ))}

      <button
        type="button"
        onClick={() => addEntry(setData, key, blankEntry)}
        className="rounded-md border px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
      >
        + {buttonText}
      </button>
    </div>
  );

  // STEP 1: PERSONAL INFORMATION
  if (step === 1) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {renderInput("Full Name", "name", "Rahul Sharma")}
        {renderInput("Roll Number", "roll", "CSE2024001")}
        {renderInput("Email", "email", "rahul@mail.com", "email")}
        {renderInput("Phone", "phone", "+91 98765 43210", "tel")}
        {renderInput("Location", "location", "Bhilwara, Rajasthan")}
        {renderInput(
          "LinkedIn URL",
          "linkedin",
          "https://linkedin.com/in/username",
          "url"
        )}
        {renderInput(
          "GitHub Profile URL",
          "github",
          "https://github.com/username",
          "url"
        )}
      </div>
    );
  }

  // STEP 2: PROFESSIONAL SUMMARY
  if (step === 2) {
    return (
      <TextArea
        label="Professional Summary"
        value={data.summary}
        placeholder="Write a brief professional summary highlighting your skills, experience, and career goals..."
        rows={5}
        onChange={(value) => updateField("summary", value)}
      />
    );
  }

  // STEP 3: SKILLS
  if (step === 3) {
    const skillCategories = [
      "Programming Languages",
      "Web Technologies",
      "Databases & Caching",
      "AI & GenAI",
      "Core Concepts",
      "Developer Tools",
      "Authentication & Security",
    ];

    // Skills are stored as one non-empty "Category: skills" line per category.
    // Empty categories are not stored, so they will not appear in the resume preview.
    const getCategorySkills = (category) => {
      const lines = (data.skills || "").split("\n");
      const prefix = `${category}:`;
      const matchingLine = lines.find((line) =>
        line.trim().startsWith(prefix)
      );

      return matchingLine
        ? matchingLine.trim().slice(prefix.length).trim()
        : "";
    };

    const updateCategorySkills = (category, value) => {
      setData((prev) => {
        const lines = (prev.skills || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .filter((line) => !line.startsWith(`${category}:`));

        if (value.trim()) {
          // Keep the saved category order consistent with the form order.
          const updatedSkills = {};
          skillCategories.forEach((name) => {
            const existingLine = lines.find((line) =>
              line.startsWith(`${name}:`)
            );
            if (name === category) {
              updatedSkills[name] = value.trim();
            } else if (existingLine) {
              updatedSkills[name] = existingLine
                .slice(existingLine.indexOf(":") + 1)
                .trim();
            }
          });

          return {
            ...prev,
            skills: skillCategories
              .filter((name) => updatedSkills[name])
              .map((name) => `${name}: ${updatedSkills[name]}`)
              .join("\n"),
          };
        }

        // When a field is cleared, remove its category completely.
        return {
          ...prev,
          skills: lines.join("\n"),
        };
      });
    };

    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold">Technical Skills</h3>
          <p className="mt-1 text-xs text-black/50">
            Fill in only the categories you want to include. Empty categories
            will not appear in your resume.
          </p>
        </div>

        {skillCategories.map((category) => (
          <TextArea
            key={category}
            label={category}
            value={getCategorySkills(category)}
            placeholder={`Enter ${category.toLowerCase()}, separated by commas`}
            rows={2}
            onChange={(value) => updateCategorySkills(category, value)}
          />
        ))}
      </div>
    );
  }

  // STEP 4: EXPERIENCE
  if (step === 4) {
    return renderEntries(
      "experience",
      "Experience",
      {
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
      [
        { key: "company", label: "Company", placeholder: "ABC Technologies" },
        { key: "role", label: "Job Title", placeholder: "Software Developer Intern" },
        { key: "location", label: "Location", placeholder: "Jaipur, India" },
        { key: "startDate", label: "Start Date", placeholder: "Jan 2026" },
        { key: "endDate", label: "End Date", placeholder: "Mar 2026 or Present" },
        {
          key: "description",
          label: "Responsibilities and Achievements",
          placeholder: "Describe your work and measurable results...",
          type: "textarea",
        },
      ],
      "Add Experience"
    );
  }

  // STEP 5: PROJECTS
  if (step === 5) {
    return renderEntries(
      "projects",
      "Project",
      {
        name: "",
        technologies: "",
        liveDemo: "",
        githubLink: "",
        description: "",
      },
      [
        {
          key: "name",
          label: "Project Name",
          placeholder: "Multi-Agent AI Interview Platform",
        },
        {
          key: "technologies",
          label: "Technologies Used",
          placeholder: "React, Node.js, MongoDB, LangGraph",
        },
        {
          key: "liveDemo",
          label: "Live Demo URL",
          placeholder: "https://your-project.vercel.app",
          type: "url",
        },
        {
          key: "githubLink",
          label: "GitHub Repository URL",
          placeholder: "https://github.com/username/project",
          type: "url",
        },
        {
          key: "description",
          label: "Project Description",
          placeholder: "Describe the features, functionality, and impact...",
          type: "textarea",
        },
      ],
      "Add Project"
    );
  }

  // STEP 6: EDUCATION
  if (step === 6) {
    return renderEntries(
      "education",
      "Education",
      {
        college: "",
        degree: "",
        branch: "",
        cgpa: "",
        year: "",
      },
      [
        {
          key: "college",
          label: "College / University",
          placeholder: "Mewar University",
        },
        { key: "degree", label: "Degree", placeholder: "B.Tech" },
        {
          key: "branch",
          label: "Branch",
          placeholder: "Computer Science and Engineering",
        },
        {
          key: "cgpa",
          label: "CGPA / Percentage",
          placeholder: "7.5 CGPA",
        },
        {
          key: "year",
          label: "Year",
          placeholder: "2023 - 2027",
        },
      ],
      "Add Education"
    );
  }

  // STEP 7: CERTIFICATIONS
  if (step === 7) {
    return renderEntries(
      "certifications",
      "Certification",
      {
        name: "",
        issuer: "",
        issueDate: "",
        credentialUrl: "",
      },
      [
        {
          key: "name",
          label: "Certificate Name",
          placeholder: "MongoDB Developer Certificate",
        },
        {
          key: "issuer",
          label: "Issuing Organization",
          placeholder: "Simplilearn",
        },
        {
          key: "issueDate",
          label: "Issue Date",
          placeholder: "Oct 2026",
        },
        {
          key: "credentialUrl",
          label: "Credential URL",
          placeholder: "https://example.com/certificate",
          type: "url",
        },
      ],
      "Add Certification"
    );
  }


  // STEP 8: ACHIEVEMENTS
  if (step === 8) {
    return renderEntries(
      "achievement",
      "Achievement",
      { title: "", description: "" },
      [
        {
          key: "title",
          label: "Achievement Title",
          placeholder: "Solved 300+ DSA problems",
        },
        {
          key: "description",
          label: "Details",
          placeholder: "Add relevant details, results, or recognition...",
          type: "textarea",
        },
      ],
      "Add Achievement"
    );
  }

  // STEP 9: CODING PROFILES
  if (step === 9) {
    return renderEntries(
      "codingProfile",
      "Coding Profile",
      { platform: "", url: "", score: "" },
      [
        {
          key: "platform",
          label: "Platform",
          placeholder: "LeetCode, GeeksforGeeks, CodeChef",
        },
        {
          key: "url",
          label: "Profile URL",
          placeholder: "https://leetcode.com/u/username/",
          type: "url",
        },
        {
          key: "score",
          label: "Score / Problems Solved",
          placeholder: "200+ problems solved",
        },
      ],
      "Add Coding Profile"
    );
  }

  // STEP 10: POSITION OF RESPONSIBILITY
  if (step === 10) {
    return renderEntries(
      "responsibility",
      "Position of Responsibility",
      {
        role: "",
        organization: "",
        duration: "",
        description: "",
      },
      [
        {
          key: "role",
          label: "Position / Role",
          placeholder: "Technical Team Lead",
        },
        {
          key: "organization",
          label: "Organization",
          placeholder: "College Coding Club",
        },
        {
          key: "duration",
          label: "Duration",
          placeholder: "Jan 2026 - May 2026",
        },
        {
          key: "description",
          label: "Responsibilities",
          placeholder: "Describe your leadership and contributions...",
          type: "textarea",
        },
      ],
      "Add Responsibility"
    );
  }

  return null;
};

export default ResumeForm;
