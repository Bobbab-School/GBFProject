using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GBF.Server.Controllers
{
    public class AwakeningDto
    {
        public int Level { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class CollectionController : ControllerBase
    {
        private readonly GBFDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CollectionController(GBFDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        // Find userId
        private bool TryGetUserId(out int userId)
        {
            userId = 0;

            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return false;

            return int.TryParse(claim.Value, out userId);
        }

        [AllowAnonymous]
        [HttpGet("characters")]
        public async Task<IActionResult> GetCharacters()
        {
            var characters = await _db.GameCharacter.ToListAsync();

            List<AccountCollection> userCollection = new();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim != null)
            {
                int userId = int.Parse(userIdClaim);
                userCollection = await _db.AccountCollection
                    .Where(ac => ac.UserId == userId)
                    .ToListAsync();
            }

            var result = characters.Select(c => new
            {
                c.CharId,
                c.Name,
                c.Rarity,
                c.Element,
                c.Series,
                c.CharUrl,
                Owned = userCollection.Any(uc => uc.CharacterId == c.CharId),
                Awakening = userCollection.FirstOrDefault(uc => uc.CharacterId == c.CharId)?.Awakening ?? 0
            });

            return Ok(result);
        }





        [Authorize]
        [HttpPost("toggle/{charId}")]
        public async Task<IActionResult> ToggleCharacter(int charId)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized("Invalid or missing user ID.");

            var existing = await _db.AccountCollection
                .FirstOrDefaultAsync(ac => ac.UserId == userId && ac.CharacterId == charId);

            if (existing != null)
            {
                _db.AccountCollection.Remove(existing);
                await _db.SaveChangesAsync();
                return Ok(new { Added = false });
            }

            _db.AccountCollection.Add(new AccountCollection
            {
                UserId = userId,
                CharacterId = charId,
                Awakening = 0,
                Completion = 0
            });

            await _db.SaveChangesAsync();
            return Ok(new { Added = true });
        }

        [Authorize]
        [HttpPost("awakening/{charId}")]
        public async Task<IActionResult> SetAwakening(int charId, [FromBody] AwakeningDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized("Invalid or missing user ID.");


            var existing = await _db.AccountCollection
                .FirstOrDefaultAsync(ac => ac.UserId == userId && ac.CharacterId == charId);

            if (existing == null)
                return NotFound("Character not in collection.");

            existing.Awakening = dto.Level;
            await _db.SaveChangesAsync();

            return Ok(new { Awakening = existing.Awakening });
        }

    }

}
