<?php
namespace BusinessMan\Bundle\QuoteBundle\Controller;

use BusinessMan\Bundle\QuoteBundle\Entity\Quote;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * QuoteController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/QuoteBundle
 */
class QuoteController extends Controller
{
    /**
     * List all quotes
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManQuoteBundle:Quote:list.html.twig');
    }

    /**
     * View a quote's details
     *
     * @param Quote $quote
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="quote.getLastModified()", vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Quote $quote)
    {
        return $this->render(
            'BusinessManQuoteBundle:Quote:view.html.twig',
            array('quote' => $quote)
        );
    }
}
