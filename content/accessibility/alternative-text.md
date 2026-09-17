---
title: Alternative text (alt text)
summary: This article outlines Microsoft accessibility style guidelines for alt text.
canonical_url: https://learn.microsoft.com/en-us/style-guide/accessibility/alternative-text
ms_date: 2026-04-03T00:00:00Z
updated_at: 2026-07-06T19:24:00Z
---

Alternative text (abbreviated as *alt text*) is a textual replacement for images, including graphics, photographs, charts, and screenshots. Alt text an essential part of accessibility because it benefits users who can't view or process images. The purpose is to provide an equivalent user experience by communicating the same basic information that other users gain from looking at the image.

In your alt text, accurately but concisely convey the image's purpose. Writing good alt text isn't about describing every detail. It requires interpretation and judgment.

## General guidelines

- Add alt text to all images that convey important meaning.
- Images that are purely decorative don't need alt text. An example is the image of an icon that immediately follows the icon name in text.
	For decorative images in web content, use null alt text (`alt=""`) instead of omitting the `alt` attribute.
- Begin alt text with a capital letter. End it with a period, even if it's just a fragment, if doing so is practical for the image type.
- Don't start alt text with a general word such as "Image." Screen readers already announce images as images. Instead, start by specifying what the image is; for example, a drawing, photograph, diagram, chart, or screenshot.
- Don't use the file name of an image as alt text.
- If text is embedded in an image, include it in the alt text if surrounding content doesn't include that information. You might need to paraphrase if you suspect that screen readers would have difficulty reading it.
- Limit the length to 150 characters. If an image is complex, consider including a detailed description in the surrounding text or in linked content.
- Avoid simply repeating surrounding text in alt text.
- If an image has a caption, ensure that the caption and alt text aren't redundant.

## Considerations for button and link images

- If a button or link has an image but no text, the image must have alt text.
- Alt text should focus on what the button or link does, not what the image shows.
- Don't start the alt text with "Button" or "Link." Screen readers already announce buttons as buttons and links as links.
- If a button or link has both an image and text, it typically doesn't need alt text because it's just decorative.

## Examples

| Scenario | Appropriate alt text | Inappropriate alt text | Notes |
| --- | --- | --- | --- |
| A procedure in technical content includes a screenshot that illustrates preceding steps by showing a tab where users enter information for creating an account. | Screenshot of the tab for creating an account. | Screenshot of the 'Create an account' tab with boxes for username, organization, and product tier and a Create button highlighted. | There's no reason to describe every detail in the interface because the procedural steps provide that information. |
| The button that opens an app's user settings has no text label and is identified only by a graphic of two gearwheels. | Open user settings. | Image of two interlocking gears, one larger than the other. | If you simply describe what the image looks like, users won't know the purpose of the button. |
| A social media post has, as its main content, a photo that shows reactions to an announcement at a product launch event. | A group of people smiling, cheering, and taking photos of a speaker. | Photograph from the launch event. | In this case, the image's meaning lies in the details of the photo and what the people are doing. The alt text needs to be descriptive to provide an equivalent user experience. |
| A search button for a website consists of a graphic of a magnifying glass but no label text. | Search this site. | Magnifying glass button for searching. | What the button does is more important than what the button image shows. |
| A link for chatting with a support agent consists of a photo of woman wearing a headset but doesn't provide link text. | Open an online chat session with customer support. | Photo of a smiling woman wearing a headset. | The alt text acts as link text, so what the link does is more important than what it looks like. |
| A link to a product upgrade page consists of the link text **Upgrade now**, followed by a graphic of the product logo. | (Not applicable.) | Graphic of the product logo. | The graphic is decorative, so it doesn't need alt text. Instead, provide a null value (`alt=""`). |

## See also

[Graphics, design, and media](graphics-design-media)  
[Everything you need to know to write effective alt text](https://support.microsoft.com/en-us/office/everything-you-need-to-know-to-write-effective-alt-text-df98f884-ca3d-456c-807b-1a1fa82f5dc2)
