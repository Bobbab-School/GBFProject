using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;



namespace GBF.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DBController : ControllerBase
    {

        private readonly GBFDbContext _db;
        private readonly IConfiguration _config;
        public DBController(GBFDbContext db, IConfiguration con)
        {
            _db = db;
            _config = con;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _db.Account.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null)
                return Unauthorized("Invalid username or password");

            // Validate password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PassHash))
                return Unauthorized("Invalid username or password");

            // Generate JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.Username) }),
                Expires = DateTime.Now.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                username = user.Username,
                token = tokenString
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto.Username.IsNullOrEmpty())
            {
                return BadRequest("Please enter a username");
            }
            // check if username is already taken
            var existingUser = await _db.Account.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (existingUser != null)
                return BadRequest("Username already exists");
            

            // hash the password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                PassHash = passwordHash
            };

            _db.Account.Add(user);
            await _db.SaveChangesAsync();

            return Ok("User registered successfully");
        }
    }
}
public class LoginDto
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class RegisterDto
{
    public string Username { get; set; }
    public string Password { get; set; }
}
