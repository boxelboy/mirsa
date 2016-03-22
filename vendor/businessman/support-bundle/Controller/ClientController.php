<?php
namespace BusinessMan\Bundle\SupportBundle\Controller;

use BusinessMan\Bundle\SupportBundle\Entity\SupportCall;
use BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\ClientBundle\Entity\Client;
use Symfony\Component\HttpFoundation\Request;
use BusinessMan\Bundle\SupportBundle\Form\Type\Create\SupportCallMessageType as CreateType;
use BusinessMan\Bundle\SupportBundle\Form\Type\Client\SupportCallType as AssignType;

/**
 * ClientController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class ClientController extends Controller
{
    /**
     * List support calls belonging to the given client
     *
     * @param Client $client
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Client $client)
    {
        return $this->render('BusinessManSupportBundle:Client:view.html.twig', array('client' => $client));
    }

    /**
     * Assign a support call to a client
     *
     * @param SupportCall $supportCall
     * @param Request     $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function assignAction(SupportCall $supportCall, Request $request)
    {
        $form = $this->createForm(new AssignType(), $supportCall);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $message = new SupportCallMessage();

            $message->setSupportCall($supportCall);
            $message->setInternal(true);
            $message->setEmailClient(false);
            $message->setIpAddress($request->getClientIp());
            $message->setCreatedBy('BusinessMan');
            $message->setDescription(
                sprintf(
                    'This ticket has been assigned to client %s (%s) by %s',
                    $supportCall->getClient()->getId(),
                    $supportCall->getClient()->getName(),
                    $this->getUser()->getStaff()->getDisplayName()
                )
            );

            $em = $this->getDoctrine()->getManager();
            $em->persist($message);
            $em->flush();

            return $this->redirect(
                $this->generateUrl('support_calls_view', array('supportCall' => $supportCall->getId()))
            );
        }

        return $this->render(
            '@BusinessManSupport/Client/assign.html.twig',
            array('form' => $form->createView(), 'supportCall' => $supportCall)
        );
    }

    /**
     * Create a support call for a client
     *
     * @param Client $client
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function createAction(Client $client, Request $request)
    {
        $supportCall = new SupportCall();
        $message = new SupportCallMessage();

        $supportCall->setClient($client);
        $message->setSupportCall($supportCall);
        $message->setStaff($this->getUser()->getStaff());
        $message->setIpAddress($request->getClientIp());
        $message->setCreatedBy($this->getUser()->getUsername());

        $form = $this->createForm(new CreateType(), $message);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($supportCall);
            $em->persist($message);
            $em->flush();

            return $this->redirect(
                $this->generateUrl('support_calls_view', array('supportCall' => $supportCall->getId()))
            );
        }

        return $this->render(
            '@BusinessManSupport/Client/create.html.twig',
            array('form' => $form->createView(), 'client' => $client)
        );
    }
}
