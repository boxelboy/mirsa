<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Entity\Contact;
use Mirsa\Bundle\MirsaBundle\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * ContactController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 */
class ContactController extends Controller
{
    /**
     * List all contacts
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:Contact:list.html.twig');
    }

    /**
     * View a contact's details
     *
     * @param Contact $contact
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function viewAction(Contact $contact)
    {
        $this->get('session')->save();

        return $this->render('MirsaMirsaBundle:Contact:view.html.twig', array('contact' => $contact));
    }

    public function resetWebAccessPasswordAction(contact $contact, Request $request)
    {
        $error = false;
        $password = $request->request->get('password');
        
        $user = $contact->getUser();
        $manager = $this->getDoctrine()->getManager();

        $user->setPassword(md5($password));
        $user->setInventoryView('No');

        // Persist the record
        $manager->persist($user);
        $manager->flush();

        return new JsonResponse(array('error' => $error));
    }

    public function addWebAccessAction(Contact $contact, Request $request)
    {

        $error = false;
        $username = $request->request->get('username');
        $password = $request->request->get('password');

        $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:User')
            ->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->andWhere('u.username = :username')
            ->setParameter('username', $username)
            ->getQuery()
            ->getSingleScalarResult();

        if ($qb == 0) {
            $user = new User();
            $manager = $this->getDoctrine()->getManager();

            $user->setContact($contact);
            $user->setUsername($username);
            $user->setPassword(md5($password));
            $user->setInventoryView('No');

            // Persist the record
            $manager->persist($user);
            $manager->flush();

            $error = false;
        } else {
            $error = true;
        }
        return new JsonResponse(array('error' => $error));
    }
    
    public function removeWebAccessAction(Contact $contact)
    {
        $user = $contact->getUser();
        $em = $this->getDoctrine()->getManager();

        $em->remove($user);
        $em->flush();

        return $this->redirect($this->generateUrl('mirsa_client_contacts_view', array('contact' => $contact->getId())));
    }

}
