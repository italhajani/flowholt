# Workflow 3 | n8n Docs

Source: https://docs.n8n.io/courses/level-two/chapter-5/chapter-5.3
Lastmod: 2026-04-14
Description: Documentation for n8n, a workflow automation platform.
# Workflow 3: Monitoring workflow errors[#](#workflow-3-monitoring-workflow-errors "Permanent link")

Last but not least, let's help Nathan know if there are any errors running the workflow.

To accomplish this task, create an Error workflow that monitors the main workflow:

1. Create a new workflow.
2. Add an **Error Trigger node** (and execute it as a test).
3. Connect a **Discord node** to the **Error Trigger node** and configure these fields:

   * **Webhook URL**: The Discord URL that you received in the email from n8n when you signed up for this course.
   * **Text**: "The workflow `{workflow name}` failed, with the error message: `{execution error message}`. Last node executed: `{name of the last executed node}`. Check this workflow execution here: `{execution URL}` My Unique ID: " followed by the unique ID emailed to you when you registered for this course.

     Note that you need to replace the text in curly brackets `{}` with expressions that take the respective information from the Error Trigger node.
4. Execute the Discord node.
5. Set the newly created workflow as the **Error Workflow** for the main workflow you created in the previous lesson.

The workflow should look like this:

[![Workflow 3 for monitoring workflow errors](/_images/courses/level-two/chapter-five/workflow3.png)](https://docs.n8n.io/_images/courses/level-two/chapter-five/workflow3.png)

*Workflow 3 for monitoring workflow errors*

Quiz questions

* What fields does the **Error Trigger node** return?
* What information about the execution does the **Error Trigger node** return?
* What information about the workflow does the **Error Trigger node** return?
* What's the expression to reference the workflow name?

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
