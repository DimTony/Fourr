using Fourteen.Application.Interfaces;
using Fourteen.Application.Features.Profiles.Queries.GetProfiles;
using Fourteen.Application.Common.DTOs;
using Fourteen.Domain.Aggregates.Profiles;
using Fourteen.Domain.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fourteen.Domain.Aggregates.Users;

namespace Fourteen.Infrastructure.Persistence.Repositories
{
    public class UserRepository
            : Repository<User, UserId>,
              IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context) { }
        
        public Task<User?> FindByGithubId(string githubId, CancellationToken ct = default)
        {
            return _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.GithubId == githubId, ct);
        }
    }
}