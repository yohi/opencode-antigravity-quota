const CLOUDCODE_BASE_URL = "https://cloudcode-pa.googleapis.com";
export async function retrieveUserQuota(accessToken, projectId) {
    const payload = { project: `projects/${projectId}` };
    const response = await fetch(`${CLOUDCODE_BASE_URL}/v1internal:retrieveUserQuota`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloud Code API 失敗: ${response.status} - ${errorText}`);
    }
    return (await response.json());
}
//# sourceMappingURL=cloudcode-client.js.map