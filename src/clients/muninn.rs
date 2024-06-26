use async_trait::async_trait;
use reqwest;
use serde::{Deserialize, Serialize};
use serde_json;
use sha2::{Digest, Sha256};
use std::error::Error;
use tracing::{error, info};

use crate::message_types::RequestMessage;

#[derive(Serialize, Deserialize)]
pub struct ChatRequest {
    pub role: String,
    pub content: String,
    pub hash: String,
}

#[derive(Serialize)]
pub struct SearchRequest {
    pub content: String,
}

#[derive(Deserialize, Clone)]
pub struct SearchResponse {
    pub role: String,
    pub content: String,
    pub hash: String,
    pub ranking: f32,
}
#[derive(Deserialize, Clone)]
pub struct ChatResponse {
    pub role: String,
    pub content: String,
    pub hash: String,
}

#[derive(Deserialize)]
pub struct AttributeResponse {
    pub attribute: String,
    pub value: String,
}

#[derive(Serialize)]
pub struct AttributeRequest {
    pub attribute: String,
    pub value: String,
}

#[async_trait]
pub trait MunninClient {
    async fn save(
        &self,
        username: &String,
        role: String,
        content: String,
    ) -> Result<(), Box<dyn Error>>;
    async fn get_chat_message(&self, username: &String, hash: &String) -> Result<ChatResponse, ()>;
    async fn search(&self, query: String) -> Result<Vec<SearchResponse>, ()>;
    async fn get_context(
        &self,
        username: &String,
        message: &RequestMessage,
    ) -> Result<Vec<ChatResponse>, ()>;
    async fn save_attribute(
        &self,
        username: &String,
        attribute: String,
        value: String,
    ) -> Result<(), ()>;
    async fn get_attribute(
        &self,
        username: &String,
        attribute: String,
    ) -> Result<AttributeResponse, ()>;
}

pub struct MunninClientImpl {
    base_url: String,
}

impl MunninClientImpl {
    pub fn new() -> Self {
        MunninClientImpl {
            base_url: "http://127.0.0.1:8080".to_string(),
        }
    }
}

#[async_trait]
impl MunninClient for MunninClientImpl {
    async fn save(
        &self,
        username: &String,
        role: String,
        content: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!(
            "{}/api/v1/chat/{}",
            self.base_url.to_string(),
            username.clone()
        );
        let client = reqwest::Client::new();

        // create a sha256 hash of the message
        let hash = Sha256::digest(content.as_bytes());

        let request_body = serde_json::to_string(&ChatRequest {
            role,
            content,
            hash: format!("{:x}", hash),
        });

        let request_body = match request_body {
            Ok(body) => body,
            Err(e) => panic!("Error serializing request body: {}", e),
        };

        let response = client
            .post(url)
            .body(request_body)
            .header("Content-Type", "application/json")
            .send()
            .await;

        match response {
            Ok(response) => {
                if response.status().is_success() {
                    info!("Message sent successfully")
                } else {
                    error!("Failed to send message: {:?}", response);
                }
            }
            Err(e) => error!("Failed to send message: {}", e),
        }

        Ok(())
    }
    async fn get_context(
        &self,
        username: &String,
        message: &RequestMessage,
    ) -> Result<Vec<ChatResponse>, ()> {
        let url = format!(
            "{}/api/v1/chat/{}/context",
            self.base_url,
            username.clone()
        );
        info!("url: {}", url);
        let client = reqwest::Client::new();

        let hash = Sha256::digest(message.text.as_bytes());

        let request_body = serde_json::to_string(&ChatRequest {
            role: "user".to_string(),
            content: message.text.clone(),
            hash: format!("{:x}", hash),
        });
        let request_body = match request_body {
            Ok(body) => body,
            Err(e) => panic!("Error serializing request body: {}", e),
        };
        // execute get request
        let response = client
            .post(url.clone())
            .body(request_body)
            .header("Content-Type", "application/json")
            .send()
            .await;

        let response = match response {
            Ok(response) => response,
            Err(e) => {
                error!("Failed to parse response to {}: {}", url.clone(), e);
                return Err(());
            }
        };

        info!("Response: {:?}", response);

        let response_body = response.json::<Vec<ChatResponse>>().await;
        let response_body = match response_body {
            Ok(body) => body,
            Err(e) => {
                error!("Failed to parse response: {}", e);
                return Err(());
            }
        };

        Ok(response_body)
    }

    async fn get_chat_message(&self, username: &String, hash: &String) -> Result<ChatResponse, ()> {
        let url = format!("{}/api/v1/chat/{}/{}", self.base_url, username, hash);
        let client = reqwest::Client::new();

        let response = client.get(url.clone()).send().await;

        let response = match response {
            Ok(response) => response,
            Err(e) => {
                error!("Failed to parse response to {}: {}", url.clone(), e);
                return Err(());
            }
        };

        info!("Response: {:?}", response);

        let response_body = response.json::<ChatResponse>().await;
        let response_body = match response_body {
            Ok(body) => body,
            Err(e) => {
                error!("Failed to parse response: {}", e);
                return Err(());
            }
        };

        Ok(response_body)
    }

    async fn search(&self, query: String) -> Result<Vec<SearchResponse>, ()> {
        let url = format!("{}/api/v1/chat", self.base_url);
        let client = reqwest::Client::new();

        let request_body = serde_json::to_string(&SearchRequest { content: query });

        let request_body = match request_body {
            Ok(body) => body,
            Err(e) => panic!("Error serializing request body: {}", e),
        };

        let response = client
            .post(url)
            .body(request_body)
            .header("Content-Type", "application/json")
            .send()
            .await;

        let response = match response {
            Ok(response) => response,
            Err(e) => {
                error!("Failed to send message: {}", e);
                return Err(());
            }
        };

        let response_body = response.json::<Vec<SearchResponse>>().await;
        let response_body = match response_body {
            Ok(body) => body,
            Err(e) => {
                error!("Failed to parse response: {}", e);
                return Err(());
            }
        };
        let var_name = Ok(response_body);
        var_name
    }

    async fn save_attribute(
        &self,
        username: &String,
        attribute: String,
        value: String,
    ) -> Result<(), ()> {
        let url = format!("{}/api/v1/attribute/{}", self.base_url, username);
        let client = reqwest::Client::new();

        let request_body = serde_json::to_string(&AttributeRequest { attribute, value });

        let request_body = match request_body {
            Ok(body) => {
                info!("request_body: {}", body);
                body
            }
            Err(e) => panic!("Error serializing request body: {}", e),
        };

        let response = client
            .post(url)
            .body(request_body)
            .header("Content-Type", "application/json")
            .send()
            .await;

        match response {
            Ok(_response) => Ok(()),
            Err(e) => {
                error!("Failed to send message: {}", e);
                return Err(());
            }
        }
    }

    async fn get_attribute(
        &self,
        username: &String,
        attribute: String,
    ) -> Result<AttributeResponse, ()> {
        let url = format!(
            "{}/api/v1/attribute/{}/{}",
            self.base_url, username, attribute
        );
        let client = reqwest::Client::new();

        let response = client.get(url.clone()).send().await;

        let response = match response {
            Ok(response) => response,
            Err(e) => {
                error!("Failed to parse response to {}: {}", url.clone(), e);
                return Err(());
            }
        };

        info!("Response: {:?}", response);

        let response_body = response.json::<AttributeResponse>().await;
        let response_body = match response_body {
            Ok(body) => body,
            Err(e) => {
                error!("Failed to parse response: {}", e);
                return Err(());
            }
        };

        Ok(response_body)
    }
}
