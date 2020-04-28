import {Tenant} from "~/tenant/types";
import {database, auth} from "~/firebase/admin";
import {DEFAULT_TENANT} from "~/tenant/constants";
import cache from "~/tenant/cache";

interface Request {
  method: "GET" | "POST" | "PATCH";
}

interface GetRequest extends Request {
  query: {
    slug: Tenant["slug"];
  };
}

interface PatchRequest extends Request {
  headers: {
    authorization: string;
  };
  query: {
    slug: Tenant["slug"];
  };
  body: {
    tenant: Tenant;
  };
}

interface PostRequest extends Request {
  body: {
    email: string;
    password: string;
    secret: string;
  };
  query: {
    slug: Tenant["slug"];
  };
}

export const api = {
  create: (email: string, password: string, slug: string) =>
    auth
      .createUser({
        email,
        password,
      })
      .then((user) =>
        database
          .collection("tenants")
          .doc(user.uid)
          .create({
            id: user.uid,
            slug,
            ...DEFAULT_TENANT,
          }),
      ),
  fetch: async (slug: Tenant["slug"]): Promise<Tenant> => {
    if (!slug) return Promise.reject({statusText: "Llamada incorrecta", status: 304});

    const cached = cache.get(slug);

    console.log(cached);

    return (
      cached ||
      database
        .collection("tenants")
        .where("slug", "==", slug)
        .limit(1)
        .get()
        .then((snapshot) =>
          snapshot.empty
            ? Promise.reject({statusText: "La tienda no existe", status: 404})
            : snapshot.docs[0],
        )
        .then((doc) => ({id: doc.id, ...(doc.data() as Tenant)}))
        .then((tenant) => {
          cache.set(slug, tenant);

          return tenant;
        })
    );
  },
  update: async (tenant: Tenant) => database.collection("tenants").doc(tenant.id).update(tenant),
};

export default (req, res) => {
  if (req.method === "GET") {
    const {
      query: {slug},
    } = req as GetRequest;

    return api
      .fetch(slug)
      .then((tenant) => res.status(200).json(tenant))
      .catch(({status, statusText}) => res.status(status).end(statusText));
  }

  if (req.method === "POST") {
    const {
      query: {slug},
      body: {email, password, secret},
    } = req as PostRequest;

    if (process.env.NODE_ENV === "production") return res.status(404);
    if (!email || !password || !slug || !secret || secret !== process.env.SECRET)
      return res.status(304).end();

    return api.create(email, password, slug).then(() => res.status(200).json({success: true}));
  }

  if (req.method === "PATCH") {
    const {
      body: {tenant},
      headers: {authorization: token},
    } = req as PatchRequest;

    if (!tenant) return res.status(304).end();

    return auth.verifyIdToken(token).then(({uid}) => {
      if (uid !== tenant.id) return res.status(403).end();

      return api.update(tenant).then(() => {
        cache.del(tenant.slug);

        return res.status(200).json(tenant);
      });
    });
  }

  return res.status(304).end();
};
