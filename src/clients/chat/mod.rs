use std::{env, fmt};

use reqwest::header;
use serde::{Deserialize, Serialize};
use serde_json::Result;
use tracing::error;

pub mod ollama;
pub mod openai;

pub use ollama::OllamaClient;
pub use openai::GptClient;

#[derive(Debug, Serialize, Deserialize)]
struct ChatRequest {
    pub model: String,
    pub messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub role: String,
    pub content: String,
}

impl fmt::Display for Message {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}: {}", self.role, self.content)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    usage: Usage,
    choices: Vec<Choice>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Usage {
    prompt_tokens: u64,
    completion_tokens: u64,
    total_tokens: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct Choice {
    message: Message,
    finish_reason: String,
    index: u64,
}

fn parse_response(json_str: &str) -> Result<ChatResponse> {
    serde_json::from_str(json_str)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Role {
    System,
    User,
    Assistant,
}

impl fmt::Display for Role {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Role::System => write!(f, "system"),
            Role::User => write!(f, "user"),
            Role::Assistant => write!(f, "assistant"),
        }
    }
}

#[async_trait::async_trait]
pub trait ChatClient: Send + Sync {
    async fn complete(&mut self, context: Vec<Message>) -> String;
}

#[allow(dead_code)]
pub struct ContextBuilder {
    messages: Vec<Message>,
}

#[allow(dead_code)]
impl ContextBuilder {
    pub fn new() -> Self {
        ContextBuilder {
            messages: Vec::new(),
        }
    }
    pub fn add_message(&mut self, role: Role, text: String) -> &mut Self {
        self.messages.push(Message {
            role: role.to_string(),
            content: text.trim().to_string(),
        });
        self
    }

    pub fn build(&self) -> Vec<Message> {
        self.messages.clone()
    }
}