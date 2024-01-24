

/// Configuration of a proxy that a Client should pass requests to.
pub struct Proxy {
    /// Proxy all traffic to the passed URL.
    all : Option<String>,
    /// Proxy all HTTP traffic to the passed URL.
    http : Option<String>,
    /// Proxy all HTTPS traffic to the passed URL.
    https : Option<String>,
}


pub struct BasicAuth {
    username: String,
    password: String,
}


pub struct ProxyConfig {
    /// The URL of the proxy server.
    url: String,
    /// Set the `Proxy-Authorization` header using Basic auth.
    basic_auth: Option<BasicAuth>,
    /// A configuration for filtering out requests that shouldn’t be proxied.
    /// Entries are expected to be comma-separated (whitespace between entries is ignored)
    no_proxy: Option<String>,
}


/// Options to configure the Rust client used to make fetch requests
pub struct ClientOptions {
    /// Defines the maximum number of redirects the client should follow.
    /// If set to 0, no redirects will be followed.
    max_redirections: Option<usize>,
    /// Timeout in milliseconds
    connect_timeout: Option<usize>,
    /// Configuration of a proxy that a Client should pass requests to.
    proxy: Option<Proxy>,
}