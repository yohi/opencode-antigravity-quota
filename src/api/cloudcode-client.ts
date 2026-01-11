import type {
  FetchAvailableModelsResponse,
  RetrieveUserQuotaResponse,
} from "./types.js";

const CLOUDCODE_BASE_URL = "https://cloudcode-pa.googleapis.com";
const USER_AGENT = "antigravity";

export async function retrieveUserQuota(
  accessToken: string,
  projectId: string
): Promise<RetrieveUserQuotaResponse> {
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
    throw new Error(
      `Cloud Code API 失敗: ${response.status} - ${errorText}`
    );
  }

  return (await response.json()) as RetrieveUserQuotaResponse;
}

export async function fetchAvailableModels(
  accessToken: string,
  projectId?: string
): Promise<FetchAvailableModelsResponse> {
  const response = await fetch(
    `${CLOUDCODE_BASE_URL}/v1internal:fetchAvailableModels`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectId ? { project: projectId } : {}),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `モデル情報の取得に失敗しました: ${response.status} - ${errorText}`
    );
  }

  return (await response.json()) as FetchAvailableModelsResponse;
}
